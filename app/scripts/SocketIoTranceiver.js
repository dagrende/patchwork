/**
 * Created by dag on 2014-03-02.
 */
(function() {
  var SocketIoTranceiver = (function() {
    var SocketIoTranceiver = function(socket) {
      this.send = function(methodName, args, result) {
        var onReceiveHandler;
        var data = {
          methodName: methodName,
          args: args,
          result: result
        };
        socket.emit('boardModelEvent', data);
      };

      this.onReceive = function(handler) {
        onReceiveHandler = handler;
      };

      var socketReceiveHandler = function(data) {
        if (onReceiveHandler) {
          onReceiveHandler(data.methodName, map2Array(data.args));
        }
      };

      var map2Array = function(args) {
        var a = [];
        for (var i in args) {
          a.push(args[i]);
        }
        return a;
      }

      socket.on('boardModelEvent', socketReceiveHandler);
    };

    return SocketIoTranceiver;
  })();

  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
    module.exports = SocketIoTranceiver;
  else
    window.SocketIoTranceiver = SocketIoTranceiver;
})();
