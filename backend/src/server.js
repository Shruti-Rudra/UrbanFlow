const app = require('./app');
const config = require('./config');
const connectDB = require('./config/db');

// Connect to database
connectDB();

const PORT = config.port || 5000;

app.listen(PORT, () => {
  console.log(`Server is running in ${config.nodeEnv} mode on port ${PORT}`);
});
