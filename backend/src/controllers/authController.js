const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../services/tokenService');
const { logActivity, ActivityTypes } = require('../services/logService');

const toUserResponse = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role
});

const sendTokenResponse = async (user, statusCode, res) => {
  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  };

  res
    .status(statusCode)
    .cookie('refreshToken', refreshToken, cookieOptions)
    .json({
      success: true,
      accessToken,
      user: toUserResponse(user)
    });
};

exports.register = async (req, res, next) => {
  try {
    const { name, email, phone, password } = req.body;

    // Validate name: only alphabets and spaces
    if (!name || !/^[a-zA-Z\s]+$/.test(name.trim())) {
      return res.status(400).json({ success: false, message: 'Full name must contain only alphabetic characters.' });
    }

    // Validate email OR phone must be provided
    if (!email && !phone) {
      return res.status(400).json({ success: false, message: 'Please provide either an email or a phone number.' });
    }

    // Validate email format if provided
    if (email && !/^[\w.-]+@[\w.-]+\.\w{2,}$/.test(email.trim())) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
    }

    // Validate phone format if provided: exactly 10 digits
    if (phone && !/^\d{10}$/.test(phone.trim())) {
      return res.status(400).json({ success: false, message: 'Phone number must be exactly 10 digits.' });
    }

    const normalizedEmail = email ? email.toLowerCase().trim() : undefined;

    // Check for existing user
    if (normalizedEmail) {
      const existingByEmail = await User.findOne({ email: normalizedEmail });
      if (existingByEmail) {
        return res.status(400).json({ success: false, message: 'User already exists with this email.' });
      }
    }
    if (phone) {
      const existingByPhone = await User.findOne({ phone: phone.trim() });
      if (existingByPhone) {
        return res.status(400).json({ success: false, message: 'User already exists with this phone number.' });
      }
    }

    // Use a default password if not provided (OTP-based flow has no password)
    const rawPassword = password || `UrbanFlow_${Date.now()}`;
    const passwordHash = await bcrypt.hash(rawPassword, 12);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      phone: phone ? phone.trim() : undefined,
      password: passwordHash
    });

    logActivity(ActivityTypes.REGISTER_SUCCESS, user._id, user.email || user.phone, 'SUCCESS', 'New user registered');
    await sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier) {
      return res.status(400).json({ success: false, message: 'Please provide an email or phone number.' });
    }

    const identifierClean = identifier.trim();

    // Determine if identifier is a phone number (10 digits) or email
    let user;
    if (/^\d{10}$/.test(identifierClean)) {
      user = await User.findOne({ phone: identifierClean }).select('+password');
    } else {
      user = await User.findOne({ email: identifierClean.toLowerCase() }).select('+password');
    }

    if (!user) {
      return res.status(401).json({ success: false, message: 'No account found with these credentials.' });
    }

    // If password provided (admin login), validate it
    if (password) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        logActivity(ActivityTypes.LOGIN_FAILED, user._id, identifier, 'FAILED', 'Incorrect password');
        return res.status(401).json({ success: false, message: 'Invalid credentials.' });
      }
    }

    logActivity(ActivityTypes.LOGIN_SUCCESS, user._id, user.email || user.phone, 'SUCCESS', 'User logged in');
    await sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

exports.refreshToken = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    return res.status(401).json({ success: false, message: 'No refresh token' });
  }

  try {
    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) throw new Error('Invalid refresh token');

    const user = await User.findById(decoded.id);
    if (!user) throw new Error('User not found');

    await sendTokenResponse(user, 200, res);
  } catch (error) {
    res.clearCookie('refreshToken');
    return res.status(401).json({ success: false, message: 'Invalid/Expired refresh token' });
  }
};

exports.logout = async (req, res, next) => {
  try {
    res.clearCookie('refreshToken');
    res.status(200).json({ success: true, message: 'Logged out successfully.' });
  } catch (error) {
    next(error);
  }
};

const sendEmail = require('../services/mailService');

// ... (previous functions toUserResponse and sendTokenResponse remain the same)

exports.requestOTP = async (req, res, next) => {
  try {
    const { identifier } = req.body;
    if (!identifier) {
      return res.status(400).json({ success: false, message: 'Please provide an email or phone number.' });
    }

    const identifierClean = identifier.trim();
    let user;
    
    // Find user by email or phone
    if (/^\d{10}$/.test(identifierClean)) {
      user = await User.findOne({ phone: identifierClean });
    } else {
      user = await User.findOne({ email: identifierClean.toLowerCase() });
    }

    // If user doesn't exist, we'll create a "placeholder" user if they are trying to register
    // But for login, we typically check if user exists.
    // Here as per requirement, we verify BEFORE login/registration.
    
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    if (!user) {
      // Create a temporary user if it's an email/phone we don't know
      // We use a dummy password since password field is required in schema
      user = await User.create({
        name: 'New User',
        email: identifierClean.includes('@') ? identifierClean.toLowerCase() : undefined,
        phone: !identifierClean.includes('@') ? identifierClean : undefined,
        password: `OTP_USER_${Date.now()}`,
        otp,
        otpExpire
      });
    } else {
      user.otp = otp;
      user.otpExpire = otpExpire;
      await user.save();
    }

    // Send the OTP
    if (user.email) {
      await sendEmail({
        email: user.email,
        subject: 'Your UrbanFlow OTP Code',
        message: 'Use the following code to verify your account and log in to UrbanFlow.',
        otp
      });
    } else {
      // Mock SMS delivery for now
      console.log(`>>> MOCK SMS to ${user.phone}: Your UrbanFlow OTP is ${otp} <<<`);
    }

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully.'
    });
  } catch (error) {
    next(error);
  }
};

exports.verifyOTP = async (req, res, next) => {
  try {
    const { identifier, otp } = req.body;
    if (!identifier || !otp) {
      return res.status(400).json({ success: false, message: 'Please provide identifier and OTP.' });
    }

    const identifierClean = identifier.trim();
    let user;
    
    if (/^\d{10}$/.test(identifierClean)) {
      user = await User.findOne({ phone: identifierClean });
    } else {
      user = await User.findOne({ email: identifierClean.toLowerCase() });
    }

    if (!user || user.otp !== otp || Date.now() > user.otpExpire) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP.' });
    }

    // Clear OTP after successful verification
    user.otp = undefined;
    user.otpExpire = undefined;
    await user.save();

    logActivity(ActivityTypes.LOGIN_SUCCESS, user._id, user.email || user.phone, 'SUCCESS', 'OTP verified, user logged in');
    await sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

exports.forgotPassword = async (req, res) => { res.status(501).json({ success: false, message: 'Not implemented' }); };
exports.resetPassword = async (req, res) => { res.status(501).json({ success: false, message: 'Not implemented' }); };
