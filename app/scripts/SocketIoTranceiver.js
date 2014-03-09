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
          args: map2Array(args),
          result: result
        };
        console.log("emit",JSON.stringify(data));
        socket.emit('boardModelEvent', data);
      };

      this.onReceive = function(handler) {
        onReceiveHandler = handler;
      };

      var socketReceiveHandler = function(data) {
        // handle some common session handling cases
        var shouldProcessMessage = false;
        if (onReceiveHandler) {
          if (this.currentServerSessionId) {
            // we have been connected to a server session
            if (this.currentServerSessionId == data.serverSessionId) {
              // it is the same server session now
              if (this.lastMessageNo < data.messageNo) {
                // higher messageNo than last one - process it
                shouldProcessMessage = true;
              }
            } else {
              // first message from this server session
              shouldProcessMessage = true;
            }
          } else {
            // first message to this client session
            shouldProcessMessage = true;
          }
          this.currentServerSessionId = data.serverSessionId;
          if (shouldProcessMessage) {
            console.log("reveive and process",data);
            this.lastMessageNo = data.messageNo;
            onReceiveHandler(data.methodName, data.args);
          } else {
            console.log("reveive and skip",data);
          }
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
