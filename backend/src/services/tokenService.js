const jwt = require('jsonwebtoken');

/**
 * Generate Access Token (short-lived)
 * @param {string} id - User ID
 * @returns {string} Access Token
 */
const generateAccessToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: '15m' // 15 minutes
  });
};

/**
 * Generate Refresh Token (long-lived)
 * @param {string} id - User ID
 * @returns {string} Refresh Token
 */
const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: '7d' // 7 days
  });
};

/**
 * Verify Refresh Token
 * @param {string} token - Refresh Token
 * @returns {Object} Decoded payload
 */
const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch (error) {
    return null;
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken
};
