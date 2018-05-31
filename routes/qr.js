var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var socket = require('socket.io-client');
var socketUrl = process.env.PORT == '3000' ? process.env.LOCALHOST : process.env.HOST;
var io =  socket.connect(socketUrl);
var googleMapsClient = require('@google/maps').createClient({
  key: process.env.GMAPS_API_KEY
});
require('dotenv').config();

var testModel = require('../models/qr_model');

router.get('/:id', function(req, res) {
  if ((req.query.lat == null) || (req.query.long == null)) {
    return res.status(200).send('Latitude atau Longitude tidak boleh null');
  } else {
    googleMapsClient.reverseGeocode({
      latlng: [req.query.lat, req.query.long],
      result_type: ['administrative_area_level_2', 'street_address'],
      location_type: ['ROOFTOP', 'APPROXIMATE'],
      language: 'id'
    }, function(err, response) {
      if (err) {
        console.log('Google Maps Client error:', err);
      } else {
        var results = response.json.results;

        var street_address = results[0].formatted_address;
        var administrative_area_level_2 = results[1].formatted_address;

        var query = {
          uniqid: req.params.id,
          opened: false
        };
        var update = {
          location: {
            geometry: {
              lat: req.query.lat,
              long: req.query.long
            },
            street_address: street_address,
            administrative_area_level_2: administrative_area_level_2
          },
          opened: true
        };
        var overwrite = {
          new: true
        };

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
      }
    });
  }
});

module.exports = router;
