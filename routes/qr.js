var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var socket = require('socket.io-client');
var opencage = require('opencage-api-client');
var googleMapsClient = require('@google/maps').createClient({
  key: process.env.GMAPS_API_KEY
});
require('dotenv').config();

var testModel = require('../models/qr_model');

if (process.env.PORT == '3000') {
  var io = socket.connect(process.env.HOST + ':' + process.env.PORT);
} else {
  var io = socket.connect(process.env.HOST);
}

function parseLocation(lat, long) {
  var loc = lat + ', ' + long;
  opencage.geocode({
    q: loc,
    language: 'id'
  }).then(function(data) {
    console.log(JSON.stringify(data));
    if (data.status.code == 200) {
      if (data.results.length > 0) {
        var place = data.results[0];
        console.log(place.formatted);
        console.log(place.components.road);
      }
    } else {
      console.log('error', data.status.message);
    }
  }).catch(function(error) {
    console.log('error', error.message);
  });
}

function reverseGeocode(lat, lng) {
  googleMapsClient.reverseGeocode({
    latlng: [lat, lng],
    result_type: ['administrative_area_level_1', 'administrative_area_level_2', 'street_address'],
    location_type: ['ROOFTOP', 'APPROXIMATE'],
    language: 'id'
  }, function(err, response) {
    if (err) {
      console.log('Google Maps Client error:', err);
    } else {
      console.log(response.json.results);
    }
  });
}

router.get('/:id', function(req, res) {
  var query = {
    uniqid: req.params.id,
    opened: false
  };
  var update = {
    location: {
      lat: req.query.lat,
      long: req.query.long
    },
    opened: true
  };
  var overwrite = {
    new: true
  };

  // parseLocation(req.query.lat, req.query.long);
  reverseGeocode(req.query.lat, req.query.long);

  testModel.findOneAndUpdate(query, update, overwrite, function(err, data) {
    if (err) {
      return res.status(500).send(err);
    } else {
      if (data != null) {
        io.emit('qr', data);
        return res.status(200).redirect(process.env.REDIRECT);
      } else {
        return res.status(200).send('ID tidak ditemukan atau sudah dibuka');
      }
    }
  });
});

module.exports = router;
