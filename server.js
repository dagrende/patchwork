var express = require('express');
var uuid = require('uuid-v4');
var http = require('http');

var port = process.env.PORT || 3000;

var app = express();
var server = http.createServer(app);

var io = require('socket.io').listen(server);
io.set('log level', 1); // reduce logging

var serverSessionId = uuid();


// here are all received events stored
var boardModelEventLog = [{ methodName: 'clearAll',
  args: [],
  result: undefined,
  messageNo: '0',
  serverSessionId: serverSessionId }];


io.sockets.on('connection', function (socket) {
  console.log('connected client ',socket.id);
  // emit all stored events
  for (var i in boardModelEventLog) {
    console.log('send log item ' + (i + 1) + '/' + boardModelEventLog.length ,boardModelEventLog[i]);
    emitBoardModelEvent(socket, i, boardModelEventLog[i]);
  }

  socket.on('boardModelEvent', function (data) {
    console.log('received from ',socket.id,data);
    var messageNo = boardModelEventLog.length;
    boardModelEventLog.push(data);
    emitBoardModelEvent(socket.broadcast, messageNo, data);
  });
  socket.on('disconnect', function () {
    console.log('disconnect client ',socket.id);
  });
});

var emitBoardModelEvent = function(socket, messageNo, data) {
  data.messageNo = messageNo;
  data.serverSessionId = serverSessionId;
  if (data.methodName === 'createNote') {
    data.args[0].id = data.result;
  }
  socket.emit('boardModelEvent', data);
};

app.use(function(req, res, next){
    console.log('%s %s', req.method, req.url);
    next();
});

/*app.use(function(req, res, next){
//  res.set('Cache-Control', 'public, max-age=5000');
  next();
});*/

app.configure('livereload', function(){
  console.log("server livereload");
  app.use(require('connect-livereload')());
  app.use(express.static(__dirname + '/.tmp'));
  app.use(express.static(__dirname + '/app'));
});

app.configure('dev', function(){
  app.use(express.static(__dirname + '/.tmp'));
  app.use(express.static(__dirname + '/app'));
});

if (process.env.NODE_ENV === undefined) {
  app.use(express.static(__dirname + '/.tmp'));
  app.use(express.static(__dirname + '/app'));
}

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
