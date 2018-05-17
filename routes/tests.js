var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var socket = require('socket.io-client')('http://localhost:3000');
var moment = require('moment');
moment.locale('id');
require('dotenv').config();

var testModel = require('../models/test_model');

// init
var redirect = process.env.REDIRECT;
var timeFormat = process.env.TIME_FORMAT;

router.get('/:id', function(req, res) {
  var uniqid = req.params.id;
  var time = moment().format(timeFormat);
  var query = {
    uniqid: uniqid,
    opened: false
  };
  var update = {
    opened_at: time,
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
        return res.status(200).redirect(redirect);
      } else {
        return res.status(200).send('id tidak ditemukan atau sudah dibuka');
      }
    }
  });
});

module.exports = router;
