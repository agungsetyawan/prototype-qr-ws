var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var moment = require('moment');
moment.locale('id');

var testModel = require('../models/test_model');
var time = moment().format('YYYY-MM-DD, HH:mm:ss');
var redirect = 'https://digitalpayment.telkomsel.com/campaign/menangbanyak';

router.get('/:id', function(req, res) {
  var uniqid = req.params.id;
  var conditions = {
    uniqid: uniqid,
    opened: false
  };
  var update = {
    opened_at: time,
    opened: true
  };
  var overwrite = {
    new: true
  };

  testModel.findOneAndUpdate(conditions, update, overwrite, function(err, data) {
    if (err) {
      return res.status(500).send(err);
    } else {
      if (data != null) {
        return res.status(200).redirect(redirect);
        // return res.status(200).send(data);
      } else {
        return res.status(200).send('id tidak ditemukan atau sudah dibuka');
      }
    }
  });
});

router.get('/qr/:socketID', function(req, res) {
  var socketID = req.params.socketID;
  var conditions = {
    socket: socketID
  }
  testModel.find(conditions, function(err, data) {
    if (err) {
      return res.status(500).send(err);
    } else {
      if (data != null) {
        return res.status(200).send(data);
      } else {
        return res.status(200).send('socketID tidak ditemukan');
      }
    }
  });
});

module.exports = router;
