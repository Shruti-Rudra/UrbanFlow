const axios = require('axios');
const config = require('../config');

/**
 * Call the FastAPI Microservice for prediction
 * @param {Object} transitData 
 * @returns {Object} Prediction result
 */
const getPrediction = async (transitData) => {
  try {
    const response = await axios.post(`${config.mlServiceUrl}/predict`, transitData, {
      timeout: 10000 // 10 seconds timeout
    });
    
    return response.data;
  } catch (error) {
    if (error.response) {
      // The request was made and the server responded with a status code outside of the range of 2xx
      const detail = error.response.data ? error.response.data.detail : error.response.statusText;
      throw new Error(`ML Service Error: ${detail}`);
    } else if (error.request) {
      // The request was made but no response was received
      throw new Error('ML Service Error: No response received from the prediction service.');
    } else {
      // Something happened in setting up the request that triggered an Error
      throw new Error(`ML Service Error: ${error.message}`);
    }
  }
};

module.exports = {
  getPrediction
};
