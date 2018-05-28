var mongoose = require('mongoose');

var schema = new mongoose.Schema({
  uniqid: {
    type: String,
    required: true
  },
  socket: {
    type: String,
    required: true
  },
  location: {
    geometry: {
      lat: {
        type: Number,
        min: -90,
        max: 90,
        default: 0
      },
      long: {
        type: Number,
        min: -180,
        max: 180,
        default: 0
      }
    },
    street_address: {
      type: String,
      default: ''
    },
    administrative_area_level_2: {
      type: String,
      default: ''
    }
  },
  opened: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'opened_at'
  }
});

module.exports = mongoose.model('qr', schema);
