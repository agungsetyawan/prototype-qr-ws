var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
var socket = require('socket.io');
var uniqid = require('uniqid');
var moment = require('moment');
var qr = require('qr-image');
moment.locale('id');
require('dotenv').config();

// routes
var indexRouter = require('./routes/index');
var qrRouter = require('./routes/qr');

// models
var qrModel = require('./models/qr_model');

var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({
  extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/qr', qrRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// module.exports = app;
module.exports = {
  app: app,
  server: server
};

// =============================================================================

// init
var hostname = process.env.HOSTNAME;
var port = process.env.PORT;
var connectionDB = process.env.DB;
var dateFormat = '|YYMMDD.HHmmss|';
var connectCounter = 0;

mongoose.Promise = Promise;
mongoose.connect(connectionDB, function() {
  try {
    console.log('database connection', connectionDB);
  } catch (error) {
    console.log('Error' + error);
  }
});

// socket.io
io.on('connection', function(socket) {
  connectCounter++;
  if (connectCounter <= 1) {
    console.log(moment().format(dateFormat), '+socket for API:', socket.id);
  } else {
    console.log(moment().format(dateFormat), '+socket:', socket.id);
  }

  function create() {
    if (connectCounter > 1) {
      // uniqid
      var uniqueID = uniqid();
      var link = 'http://' + hostname + ':' + port + '/qr/' + uniqueID;
      var svg_string = qr.imageSync(link, {
        type: 'svg'
      });
      var linkData = {
        uniqid: uniqueID,
        socket: socket.id,
        opened: false,
        qr: svg_string
      }
      // add to database
      qrModel.create(linkData);
      return linkData;
    }
  }

  socket.on('disconnect', function() {
    connectCounter--;
    console.log(moment().format(dateFormat), '-socket:', socket.id);
    var query = {
      socket: socket.id,
      opened: false
    };
    //remove from database
    qrModel.remove(query, function(err) {
      if (err) return handleError(err);
      // removed!
    });
  });

  socket.on('qr', function(data) {
    console.log(moment().format(dateFormat), '/socket:', 'received from', socket.id);
    var query = {
      uniqid: data.uniqid,
      socket: data.socket,
      opened: true
    }
    qrModel.find(query, function(err, data) {
      if (err) {
        return handleError(err);
      } else {
        if (data != null) {
          var message = data[0];

          function recreate() {
            // uniqid
            var uniqueID = uniqid();
            var link = 'http://' + hostname + ':' + port + '/qr/' + uniqueID;
            var svg_string = qr.imageSync(link, {
              type: 'svg'
            });
            var linkData = {
              uniqid: uniqueID,
              socket: message.socket,
              opened: false,
              qr: svg_string
            }
            // add to database
            qrModel.create(linkData);
            return linkData;
          }
          socket.to(message.socket).emit('qr', recreate());
        }
      }
    });
  });

  socket.emit('qr', create());
});
