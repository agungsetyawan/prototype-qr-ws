var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var socket = require('socket.io-client')('http://localhost:' + process.env.PORT);
require('dotenv').config();

var testModel = require('../models/qr_model');

router.get('/:id', function(req, res) {
  var uniqid = req.params.id;
  var query = {
    uniqid: uniqid,
    opened: false
  };
  var update = {
    opened: true,
    qr: ''
  };
  var overwrite = {
    new: true
  };

  testModel.findOneAndUpdate(query, update, overwrite, function(err, data) {
    if (err) {
      return res.status(500).send(err);
    } else {
      if (data != null) {
        socket.emit('qr', data);
        return res.status(200).redirect(process.env.REDIRECT);
      } else {
        return res.status(200).send('ID tidak ditemukan atau sudah dibuka');
      }
    }
  });
});

module.exports = router;
