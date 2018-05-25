var mongoose = require('mongoose');

var schema = new mongoose.Schema({
  uniqid: String,
  socket: String,
  location: {
    lat: Number,
    long: Number
  },
  opened: Boolean
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'opened_at'
  }
});

module.exports = mongoose.model('qr', schema);
