/**
 * Check the server status
 * @route GET /api/health
 */
const getHealthStatus = (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      data: {
        status: 'UP',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getHealthStatus
};
