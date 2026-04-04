/**
 * A simple logging service for security audit trails
 */

const logActivity = (type, userId, identifier, status, message) => {
  const timestamp = new Date().toISOString();
  // In production, this might go to a DB or an ELK stack
  // For this project, we'll log to console or a file
  console.log(`[AUDIT LOG] [${timestamp}] [${type}] User:${userId || 'N/A'} Identifier:${identifier} Status:${status} - ${message}`);
};

const ActivityTypes = {
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILED: 'LOGIN_FAILED',
  REGISTER_SUCCESS: 'REGISTER_SUCCESS',
  OTP_REQUESTED: 'OTP_REQUESTED',
  OTP_VERIFIED: 'OTP_VERIFIED',
  OTP_FAILED: 'OTP_FAILED',
  PASSWORD_RESET: 'PASSWORD_RESET',
  ACCOUNT_LOCKED: 'ACCOUNT_LOCKED',
  UNAUTHORIZED_ACCESS: 'UNAUTHORIZED_ACCESS'
};

module.exports = {
  logActivity,
  ActivityTypes
};
