var mongoose = require('mongoose');

var QRSchema = new mongoose.Schema({
  uniqid: String,
  socket: String,
  opened: Boolean,
  qr: String
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'opened_at'
  }
});

module.exports = mongoose.model('qr', QRSchema);
