var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
// var io = require('socket.io')();

var Chats = mongoose.model('chats', {
  name: String,
  chat: String
});

router.post('/', function(req, res, next) {
  try {
    var chat = new Chats(req.body);
    chat.save();
    res.sendStatus(200);
  } catch (error) {
    res.sendStatus(500);
    console.error(error);
  }
});

router.get('/', function(req, res, next) {
  Chats.find({}, function(error, chats) {
    res.send(chats);
  });
});

module.exports = router;
