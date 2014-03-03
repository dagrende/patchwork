/**
 * Created by dag on 2014-02-24.
 */
function RemoteEnabler(service, methods, transceiver, receiveNofifier) {
  var interceptorByMethod = {};
  var MethodInterceptor = function(service, method) {
    var originalMethod = service[method];
    service[method] = function() {
      var result = originalMethod.apply(service, arguments);
      transceiver.send(method, arguments, result);
      return  result;
    };
    this.callOriginalMethod = function(args) {
     originalMethod.apply(service, args);
    };
  };
  var receiveHandler = function(method, args){
    interceptorByMethod[method].callOriginalMethod(args);
    if (receiveNofifier) {
      receiveNofifier();
    }
  };

  for (var i in methods) {
    var method = methods[i];
    interceptorByMethod[method] = new MethodInterceptor(service, method);
  }
  transceiver.onReceive(receiveHandler);
}