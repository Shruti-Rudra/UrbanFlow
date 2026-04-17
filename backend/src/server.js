const app = require('./app');
const config = require('./config');
const { connectDB } = require('./config/db');
const { seedAdmin } = require('./config/seed');

const PORT = config.port || 5000;

const startServer = async () => {
  try {
    await connectDB();
    console.log('✅ MongoDB connected successfully');
    
    // Seed admin user after DB connection
    await seedAdmin();
  } catch (error) {
    console.error(`⚠️  MongoDB connection failed: ${error.message}`);
    console.warn('🚀 Starting server WITHOUT database connection. Auth/predict routes will return errors when DB is needed.');
    // Do NOT exit — let the server start so health check still works
  }

  app.listen(PORT, () => {
    console.log(`✅ Server is running in ${config.nodeEnv} mode on port ${PORT}`);
    console.log(`📍 Available endpoints: GET /, /api/health, POST /api/predict, POST /api/auth/login, POST /api/auth/register`);
  });
};

startServer();
