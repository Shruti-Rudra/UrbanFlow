const express = require('express');
const { 
  register, 
  login, 
  logout, 
  refreshToken,
  requestOTP,
  verifyOTP
} = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

/**
 * @desc Auth Routes
 */
router.post('/register', register);
router.post('/login', login);
router.post('/request-otp', requestOTP);
router.post('/verify-otp', verifyOTP);
router.post('/refresh', refreshToken);
router.get('/logout', logout);
router.post('/logout', logout);

// Example protected route for testing
router.get('/me', protect, (req, res) => {
  res.status(200).json({
    success: true,
    data: req.user
  });
});

module.exports = router;
