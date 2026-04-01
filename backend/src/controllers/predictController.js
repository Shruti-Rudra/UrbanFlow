const mlService = require('../services/mlService');

/**
 * Accept transit input data and return predicted travel time
 * @route POST /api/predict
 */
const predictTravelTime = async (req, res, next) => {
  try {
    const transitData = req.body;
    
    // Call the Python ML Service
    const predictionResult = await mlService.getPrediction(transitData);
    
    res.status(200).json({
      success: true,
      data: predictionResult
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  predictTravelTime
};
