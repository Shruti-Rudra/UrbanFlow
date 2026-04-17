const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const securityMiddleware = require('./middlewares/securityMiddleware');
const errorHandler = require('./middlewares/errorHandler');

const healthRoutes = require('./routes/healthRoutes');
const predictRoutes = require('./routes/predictRoutes');
const authRoutes = require('./routes/authRoutes');
const transitRoutes = require('./routes/transitRoutes');

const app = express();

// Security Middlewares
// securityMiddleware(app);

// Standard Middlewares
app.use(cors({ origin: true, credentials: true })); // Enable credentials for cookies
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'UrbanFlow Backend API is running',
    endpoints: ['/api/health', '/api/predict', '/api/auth']
  });
});

app.use('/api/health', healthRoutes);
app.use('/api/predict', predictRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/transit', transitRoutes);
app.use('/auth', authRoutes);

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
