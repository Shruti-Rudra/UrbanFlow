const express = require('express');
const { 
  getAllStations, 
  getAllRoutes, 
  getAllBuses,
  getNearbyStations,
  createStation,
  updateStation,
  deleteStation,
  createRoute,
  updateRoute,
  deleteRoute,
  createBus,
  updateBus,
  deleteBus
} = require('../controllers/transitController');
const { protect, authorize } = require('../middlewares/authMiddleware');

const router = express.Router();

// Public routes
router.get('/stations', getAllStations);
router.get('/routes', getAllRoutes);
router.get('/buses', getAllBuses);
router.get('/nearby', getNearbyStations);

// Admin-only routes
router.use(protect);
router.use(authorize('admin'));

// Station CRUD
router.post('/stations', createStation);
router.put('/stations/:id', updateStation);
router.delete('/stations/:id', deleteStation);

// Route CRUD
router.post('/routes', createRoute);
router.put('/routes/:id', updateRoute);
router.delete('/routes/:id', deleteRoute);

// Bus CRUD
router.post('/buses', createBus);
router.put('/buses/:id', updateBus);
router.delete('/buses/:id', deleteBus);

module.exports = router;
