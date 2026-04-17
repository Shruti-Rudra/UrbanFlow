const Station = require('../models/Station');
const Route = require('../models/Route');
const Bus = require('../models/Bus');
const csvService = require('../services/csvService');

/**
 * @desc Get all stations
 * @route GET /api/transit/stations
 */
exports.getAllStations = async (req, res, next) => {
  try {
    const mongoStations = await Station.find();
    const csvStations = csvService.getStations();
    
    const combined = [...csvStations, ...mongoStations];
    
    res.status(200).json({
      success: true,
      count: combined.length,
      data: combined
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get all routes
 * @route GET /api/transit/routes
 */
exports.getAllRoutes = async (req, res, next) => {
  try {
    const mongoRoutes = await Route.find().populate('stations');
    const csvRoutes = csvService.getRoutes();
    
    const combined = [...csvRoutes, ...mongoRoutes];
    
    res.status(200).json({
      success: true,
      count: combined.length,
      data: combined
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get all buses
 * @route GET /api/transit/buses
 */
exports.getAllBuses = async (req, res, next) => {
  try {
    const mongoBuses = await Bus.find().populate('routeId');
    const csvBuses = csvService.getBuses();
    
    const combined = [...csvBuses, ...mongoBuses];
    
    res.status(200).json({
      success: true,
      count: combined.length,
      data: combined
    });
  } catch (error) {
    next(error);
  }
};
/**
 * @desc Get nearby stations based on coordinates
 * @route GET /api/transit/nearby
 */
exports.getNearbyStations = async (req, res, next) => {
  try {
    const { lat, lng } = req.query;
    if (!lat || !lng) {
      return res.status(400).json({ success: false, message: 'Please provide coordinates.' });
    }

    const mongoStations = await Station.find();
    const csvStations = csvService.getStations();
    
    const allStations = [...csvStations, ...mongoStations];
    
    // Haversine formula to calculate distance
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
      const R = 6371; // km
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c;
    };

    const nearby = allStations.map(station => {
      const stationData = station.toObject ? station.toObject() : station;
      return {
        ...stationData,
        distance: calculateDistance(lat, lng, stationData.lat, stationData.lng)
      };
    })
    .sort((a, b) => a.distance - b.distance);

    res.status(200).json({
      success: true,
      data: nearby
    });
  } catch (error) {
    next(error);
  }
};

// --- Station CRUD ---

/**
 * @desc Create a new station
 * @route POST /api/transit/stations
 */
exports.createStation = async (req, res, next) => {
  try {
    const station = await Station.create(req.body);
    res.status(201).json({ success: true, data: station });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Update a station
 * @route PUT /api/transit/stations/:id
 */
exports.updateStation = async (req, res, next) => {
  try {
    const station = await Station.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!station) return res.status(404).json({ success: false, message: 'Station not found' });
    res.status(200).json({ success: true, data: station });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Delete a station
 * @route DELETE /api/transit/stations/:id
 */
exports.deleteStation = async (req, res, next) => {
  try {
    const station = await Station.findByIdAndDelete(req.params.id);
    if (!station) return res.status(404).json({ success: false, message: 'Station not found' });
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

// --- Route CRUD ---

/**
 * @desc Create a new route
 * @route POST /api/transit/routes
 */
exports.createRoute = async (req, res, next) => {
  try {
    const route = await Route.create(req.body);
    res.status(201).json({ success: true, data: route });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Update a route
 * @route PUT /api/transit/routes/:id
 */
exports.updateRoute = async (req, res, next) => {
  try {
    const route = await Route.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!route) return res.status(404).json({ success: false, message: 'Route not found' });
    res.status(200).json({ success: true, data: route });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Delete a route
 * @route DELETE /api/transit/routes/:id
 */
exports.deleteRoute = async (req, res, next) => {
  try {
    const route = await Route.findByIdAndDelete(req.params.id);
    if (!route) return res.status(404).json({ success: false, message: 'Route not found' });
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

// --- Bus CRUD ---

/**
 * @desc Create a new bus
 * @route POST /api/transit/buses
 */
exports.createBus = async (req, res, next) => {
  try {
    const bus = await Bus.create(req.body);
    const populatedBus = await Bus.findById(bus._id).populate('routeId');
    
    // Optional Enhancement: Append to CSV
    if (populatedBus && populatedBus.routeId) {
      const routeName = populatedBus.routeId.name;
      const [from, to] = routeName.split(' - ');
      
      csvService.appendToCSV({
        Bus_ID: populatedBus.busNumber,
        From: from || 'Pandesara',
        To: to || 'Varachha',
        Distance_km: '10', // Default
        Traffic_Density: '3',
        Is_Peak_Hour: '0',
        Weather: 'Clear',
        Stops: '5',
        Speed: '30',
        Actual_Travel_Time: '20',
        Is_Late: '0',
        Is_Fastest_Route: '1'
      });
    }

    res.status(201).json({ success: true, data: populatedBus });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Update a bus
 * @route PUT /api/transit/buses/:id
 */
exports.updateBus = async (req, res, next) => {
  try {
    const bus = await Bus.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('routeId');
    if (!bus) return res.status(404).json({ success: false, message: 'Bus not found' });
    res.status(200).json({ success: true, data: bus });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Delete a bus
 * @route DELETE /api/transit/buses/:id
 */
exports.deleteBus = async (req, res, next) => {
  try {
    const bus = await Bus.findByIdAndDelete(req.params.id);
    if (!bus) return res.status(404).json({ success: false, message: 'Bus not found' });
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};
