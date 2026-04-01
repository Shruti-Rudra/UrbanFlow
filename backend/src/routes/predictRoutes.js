const express = require('express');
const { predictTravelTime } = require('../controllers/predictController');
const { validatePredictionRequest } = require('../middlewares/validateRequest');

const router = express.Router();

// POST /api/predict
router.post('/', validatePredictionRequest, predictTravelTime);

module.exports = router;
