var httpProxy = require('http-proxy');

var proxy = new httpProxy.createProxyServer();

function setup(peliasConfig) {
  var currentVersion = peliasConfig.version; //TODO :add to pelias-config

  var middleware = function middleware(req, res, next){
    var reqVersion = req.params.vr;
    // if URI contains v1, handle locally
    if (currentVersion === reqVersion) { // uri contains v1
      next();
    } else if (peliasConfig.proxyMap.hasOwnProperty(reqVersion)){ // else send to legacy server
      var host = peliasConfig.proxyMap[reqVersion];
      req.url = req.url.substring(1 + reqVersion.length);
      proxy.proxyRequest(req, res, { target: host });
    } else {
      throw new Error('can\'t handle this version');
    }
  };

  return middleware;
}

module.exports = setup;
