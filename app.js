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

var indexRouter = require('./routes/index');
var chatsRouter = require('./routes/chats');
var testsRouter = require('./routes/tests');
var thanksRouter = require('./routes/thanks');

var testModel = require('./models/test_model');

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
app.use('/chats', chatsRouter);
app.use('/test', testsRouter);
app.use('/thanks', thanksRouter);

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
var timeFormat = process.env.TIME_FORMAT;

// database MongoDB
var connectionDB = 'mongodb://localhost:27017/mylearning';
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
  console.log('+socket:', socket.id, 'connected');
  function create() {
    // uniqid
    var uniqueID = uniqid();
    var time = moment().format(timeFormat);
    var link = 'http://' + hostname + ':3000/test/' + uniqueID;
    var svg_string = qr.imageSync(link, {
      type: 'svg'
    });
    var linkData = {
      uniqid: uniqueID,
      socket: socket.id,
      created_at: time,
      opened_at: '',
      opened: false,
      qr: svg_string
    }
    // add to database
    testModel.create(linkData);
    return linkData;
  }
  create();

  socket.on('disconnect', function() {
    console.log('-socket:', socket.id, 'disconnected');
    var query = {
      socket: socket.id,
      opened: false
    };
    //remove from database
    testModel.remove(query, function(err) {
      if (err) return handleError(err);
      // removed!
    });
  });

  socket.on('qr', function(data) {
    console.log('/socket api:', 'received from', socket.id);
    var query = {
      uniqid: data.uniqid,
      socket: data.socket,
      opened: true
    }
    testModel.find(query, function(err, data) {
      if (err) {
        return handleError(err);
      } else {
        if (data != null) {
          var message = data[0];
          function recreate() {
            // uniqid
            var uniqueID = uniqid();
            var time = moment().format(timeFormat);
            var link = 'http://' + hostname + ':3000/test/' + uniqueID;
            var svg_string = qr.imageSync(link, {
              type: 'svg'
            });
            var linkData = {
              uniqid: uniqueID,
              socket: message.socket,
              created_at: time,
              opened_at: '',
              opened: false,
              qr: svg_string
            }
            // add to database
            testModel.create(linkData);
            return linkData;
          }
          socket.to(message.socket).emit('qr', recreate());
        }
      }
    });
  });
  socket.emit('qr', create());

  socket.on('chat', function(data) {
    // hanya kirim ke orang lain
    socket.broadcast.emit('chat', data);

    //kirim ke diri sendiri juga
    // io.sockets.emit('chat', data);
  });
});
