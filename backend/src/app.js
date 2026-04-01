const express = require('express');
const cors = require('cors');
const { errorHandler } = require('./middlewares/errorHandler');

const healthRoutes = require('./routes/healthRoutes');
const predictRoutes = require('./routes/predictRoutes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'UrbanFlow Backend API is running',
    endpoints: ['/api/health', '/api/predict']
  });
});

app.use('/api/health', healthRoutes);
app.use('/api/predict', predictRoutes);

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global Error Handler
app.use(errorHandler);

module.exports = app;
