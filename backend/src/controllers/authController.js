const User = require('../models/User');
const { generateAccessToken, generateRefreshToken } = require('../services/tokenService');
const { logActivity, ActivityTypes } = require('../services/logService');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

// Generate 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

/**
 * @desc Register user
 * @route POST /api/auth/register
 */
exports.register = async (req, res, next) => {
  try {
    const { name, email, phone, password } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ 
      $or: [{ email }, { phone }] 
    });

    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists with this email or phone' });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      phone,
      password
    });

    logActivity(ActivityTypes.REGISTER_SUCCESS, user._id, email, 'SUCCESS', 'New user registered');

    sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Login user with password
 * @route POST /api/auth/login
 */
exports.login = async (req, res, next) => {
  try {
    const { identifier, password } = req.body; // identifier can be email or phone

    // Validate email & password
    if (!identifier || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email/phone and password' });
    }

    // Check for user
    const user = await User.findOne({
      $or: [{ email: identifier }, { phone: identifier }]
    }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check if account is locked
    if (user.isLocked()) {
      logActivity(ActivityTypes.ACCOUNT_LOCKED, user._id, identifier, 'LOCKED', 'Login attempt on locked account');
      return res.status(423).json({ 
        success: false, 
        message: `Account is temporarily locked. Try again after ${user.lockUntil.toLocaleTimeString()}` 
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      user.loginAttempts += 1;
      if (user.loginAttempts >= 5) {
        user.lockUntil = Date.now() + 30 * 60 * 1000; // 30 minutes lock
        logActivity(ActivityTypes.ACCOUNT_LOCKED, user._id, identifier, 'LOCKED', 'Account locked due to 5 failed attempts');
      }
      await user.save();
      
      logActivity(ActivityTypes.LOGIN_FAILED, user._id, identifier, 'FAILED', `Incorrect password attempt (${user.loginAttempts}/5)`);
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Reset login attempts on success
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    await user.save();

    logActivity(ActivityTypes.LOGIN_SUCCESS, user._id, identifier, 'SUCCESS', 'User logged in with password');

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Request OTP for login
 * @route POST /api/auth/otp/request
 */
exports.requestOTP = async (req, res, next) => {
  try {
    const { identifier } = req.body;

    const user = await User.findOne({
      $or: [{ email: identifier }, { phone: identifier }]
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'No account found with this email/phone' });
    }

    // Cooldown check (60 seconds)
    if (user.otpExpiry && (user.otpExpiry.getTime() - Date.now() > 4 * 60 * 1000)) {
       // If OTP was sent less than 60s ago (assuming 5m expiry)
       return res.status(429).json({ success: false, message: 'Please wait 60 seconds before requesting a new OTP' });
    }

    const otp = generateOTP();
    user.otp = await bcryptHash(otp); // We should hash OTP in DB too for security
    user.otpExpiry = Date.now() + 5 * 60 * 1000; // 5 minutes
    user.otpAttempts = 0;
    await user.save();

    console.log(`\n--- PRODUCTION SIMULATION ---`);
    console.log(`[OTP] To: ${identifier}`);
    console.log(`[OTP] Code: ${otp}`);
    console.log(`-----------------------------\n`);

    logActivity(ActivityTypes.OTP_REQUESTED, user._id, identifier, 'SENT', 'OTP generated and logged to console');

    res.status(200).json({ success: true, message: 'OTP sent successfully (check console in development mode)' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Verify OTP and login
 * @route POST /api/auth/otp/verify
 */
exports.verifyOTP = async (req, res, next) => {
  try {
    const { identifier, otp } = req.body;

    const user = await User.findOne({
      $or: [{ email: identifier }, { phone: identifier }]
    });

    if (!user || !user.otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP request' });
    }

    // Check expiry
    if (user.otpExpiry < Date.now()) {
      user.otp = undefined;
      user.otpExpiry = undefined;
      await user.save();
      return res.status(400).json({ success: false, message: 'OTP has expired' });
    }

    // Check attempts
    if (user.otpAttempts >= 3) {
      user.otp = undefined;
      user.otpExpiry = undefined;
      await user.save();
      return res.status(403).json({ success: false, message: 'Max OTP attempts reached. Request a new one.' });
    }

    // Match OTP
    const isMatch = await bcryptCompare(otp, user.otp);

    if (!isMatch) {
      user.otpAttempts += 1;
      await user.save();
      logActivity(ActivityTypes.OTP_FAILED, user._id, identifier, 'FAILED', `Incorrect OTP attempt (${user.otpAttempts}/3)`);
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    // Success
    user.otp = undefined;
    user.otpExpiry = undefined;
    user.otpAttempts = 0;
    user.loginAttempts = 0; // Reset locking if they used OTP
    await user.save();

    logActivity(ActivityTypes.OTP_VERIFIED, user._id, identifier, 'SUCCESS', 'User logged in with OTP');

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Refresh Token
 * @route POST /api/auth/refresh
 */
exports.refreshToken = async (req, res, next) => {
  const token = req.cookies.refreshToken;

  if (!token) {
    return res.status(401).json({ success: false, message: 'No refresh token' });
  }

  try {
    const decoded = require('../services/tokenService').verifyRefreshToken(token);
    if (!decoded) throw new Error('Invalid refresh token');

    const user = await User.findById(decoded.id);
    if (!user) throw new Error('User not found');

    sendTokenResponse(user, 200, res);
  } catch (error) {
    res.clearCookie('refreshToken');
    return res.status(401).json({ success: false, message: 'Invalid/Expired refresh token' });
  }
};

/**
 * @desc Logout user / clear cookies
 * @route GET /api/auth/logout
 */
exports.logout = async (req, res, next) => {
  res.cookie('refreshToken', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({ success: true, message: 'Logged out' });
};

/**
 * @desc Forgot Password - Generate Reset Token
 * @route POST /api/auth/forgot-password
 */
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'No account found with this email' });
    }

    // Generate token
    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    await user.save();

    console.log(`\n--- PRODUCTION SIMULATION (FORGOT PASSWORD) ---`);
    console.log(`[EMAIL] To: ${email}`);
    console.log(`[EMAIL] Reset Link: http://localhost:5173/reset-password/${resetToken}`);
    console.log(`----------------------------------------------\n`);

    logActivity(ActivityTypes.PASSWORD_RESET, user._id, email, 'SENT', 'Reset token generated and logged');

    res.status(200).json({ success: true, message: 'Reset link sent to email' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Reset Password
 * @route PUT /api/auth/reset-password/:resetToken
 */
exports.resetPassword = async (req, res, next) => {
  try {
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resetToken)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    logActivity(ActivityTypes.PASSWORD_RESET, user._id, user.email, 'SUCCESS', 'Password updated successfully');

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// --- Helper Functions ---

const bcryptHash = async (val) => await bcrypt.hash(val, 10);
const bcryptCompare = async (val, hashed) => await bcrypt.compare(val, hashed);

const sendTokenResponse = (user, statusCode, res) => {
  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
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
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
};
