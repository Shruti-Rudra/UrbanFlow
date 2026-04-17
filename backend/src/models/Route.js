const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Route name is required'],
    trim: true,
    unique: true
  },
  stations: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Station'
  }],
  color: {
    type: String,
    default: '#6366f1' // Default Indigo
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Route', routeSchema);
