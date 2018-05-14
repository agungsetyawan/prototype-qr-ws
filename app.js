var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
var socket = require('socket.io');
var uniqid = require('uniqid');
var moment = require('moment');
moment.locale('id');
var qr = require('qr-image');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var chatsRouter = require('./routes/chats');
var testsRouter = require('./routes/tests');

var testModel = require('./models/test_model');

var app = express();
var server = app.listen(3000, function() {
  console.log('listening to requests on port 3000');
});

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
app.use('/users', usersRouter);
app.use('/chats', chatsRouter);
app.use('/test', testsRouter);

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

module.exports = app;

// =============================================================================

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
var io = socket(server);
io.on('connection', function(socket) {
  console.log('+socket:', socket.id, 'connected');

  // uniqid
  var uniqueID = uniqid();
  var time = moment().format('YYYY-MM-DD, HH:mm:ss');
  var link = 'http://localhost:3000/test?id=' + uniqueID;
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
  testModel.create(linkData);

  socket.on('disconnect', function() {
    console.log('-socket:', socket.id, 'disconnected');
    testModel.remove({
      socket: socket.id,
      opened: false
    }, function(err) {
      if (err) return handleError(err);
      // removed!
    });
  });
  socket.on('chat', function(data) {
    // hanya kirim ke orang lain
    socket.broadcast.emit('chat', data);

    //kirim ke diri sendiri juga
    // io.sockets.emit('chat', data);
  });
});
