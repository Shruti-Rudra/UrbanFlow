const { body, validationResult } = require('express-validator');

const validatePredictionRequest = [
  body('Route_Name').notEmpty().withMessage('Route_Name is required').isString(),
  body('Distance_km').notEmpty().withMessage('Distance_km is required').isFloat({ min: 0 }),
  body('Traffic_Density').optional().isFloat({ min: 0, max: 10 }).withMessage('Traffic_Density must be a float between 0 and 10'),
  body('Weather').notEmpty().withMessage('Weather is required').isString(),
  body('Is_Peak_Hour').notEmpty().withMessage('Is_Peak_Hour is required').isInt({ min: 0, max: 1 }),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Data validation failed',
        errors: errors.array()
      });
    }
    next();
  }
];

module.exports = {
  validatePredictionRequest
};
