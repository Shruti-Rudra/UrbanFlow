const express = require('express');
const { 
  register, 
  login, 
  requestOTP, 
  verifyOTP, 
  logout, 
  refreshToken,
  forgotPassword,
  resetPassword 
} = require('../controllers/authController');
const { protect, authorize } = require('../middlewares/authMiddleware');

const router = express.Router();

/**
 * @desc Auth Routes
 */
router.post('/register', register);
router.post('/login', login);
router.post('/otp/request', requestOTP);
router.post('/otp/verify', verifyOTP);
router.post('/refresh', refreshToken);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:resetToken', resetPassword);
router.get('/logout', logout);

// Example protected route for testing
router.get('/me', protect, (req, res) => {
  res.status(200).json({
    success: true,
    data: req.user
  });
});

// Example admin-only route
router.get('/admin', protect, authorize('admin'), (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome Admin'
  });
});

module.exports = router;
