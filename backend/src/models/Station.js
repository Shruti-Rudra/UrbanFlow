const mongoose = require('mongoose');

const stationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Station name is required'],
    trim: true
  },
  code: {
    type: String,
    required: [true, 'Station code is required'],
    unique: true,
    uppercase: true
  },
  lat: {
    type: Number,
    required: [true, 'Latitude is required']
  },
  lng: {
    type: Number,
    required: [true, 'Longitude is required']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Station', stationSchema);
