var mongoose = require('mongoose');

var TestSchema = new mongoose.Schema({
  uniqid: String,
  socket: String,
  created_at: String,
  opened_at: String,
  opened: Boolean,
  qr: String
});

module.exports = mongoose.model('test', TestSchema);
