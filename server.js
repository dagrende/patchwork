var express = require('express');
var port = process.env.PORT || 3000;

var app = express();

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


app.listen(port);
console.log('Listening on port ' + port + '...');
