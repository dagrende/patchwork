var express = require('express');
var port = process.env.PORT || 3000;

var app = express();
var http = require('http');
var server = http.createServer(app);


var io = require('socket.io').listen(server);

// here are all received events stored
var boardModelEventLog = [];

io.sockets.on('connection', function (socket) {
  console.log('connected socket.io')
  // emit all stored events
  for (var i in boardModelEventLog) {
    emitBoardModelEvent(socket, boardModelEventLog[i]);
  }

  socket.on('boardModelEvent', function (data) {
    console.log('received',data);
    boardModelEventLog.push(data);
    emitBoardModelEvent(socket.broadcast, data);
  });
});

var emitBoardModelEvent = function(socket, data) {
  if (data.methodName === 'createNote') {
    data.args[0].id = data.result;
  }
  socket.emit('boardModelEvent', data);
};

app.use(function(req, res, next){
    console.log('%s %s', req.method, req.url);
    next();
});

app.use(require('connect-livereload')());

app.configure('dev', function(){
  app.use(express.static(__dirname + '/.tmp'));
  app.use(express.static(__dirname + '/app'));
});

app.configure('test', function(){
  app.use(express.static(__dirname + '/.tmp'));
  app.use(express.static(__dirname + '/test'));
  app.use(express.static(__dirname + '/app'));
});

app.configure('dist', function(){
  app.use(express.static(__dirname + '/dist'));
});


server.listen(port);
console.log('Listening on port ' + port + '...');
