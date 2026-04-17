require('dotenv').config();

module.exports = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mlServiceUrl: process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000',
  mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/UrbanFlow'
};

