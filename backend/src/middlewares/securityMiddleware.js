const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');

/**
 * Configure all security middlewares
 */
const securityMiddleware = (app) => {
  // Set security HTTP headers
  app.use(helmet());

  // Prevent NoSQL injection
  app.use(mongoSanitize());

  // Prevent HTTP Parameter Pollution
  app.use(hpp());

  // Rate limiting (Global)
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 mins
    max: 100, // limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use('/api', limiter);

  // Specific rate limit for Auth
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 20, // 20 requests per 15 minutes
    message: 'Too many login attempts from this IP, please try again after 15 minutes',
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use('/api/auth', authLimiter);
  
  // Strict rate limit for OTP
  const otpLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, 
    max: 5, // 5 OTP requests per 10 minutes
    message: 'Too many OTP requests from this IP, please try again after 10 minutes',
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use('/api/auth/otp/request', otpLimiter);
};

module.exports = securityMiddleware;
