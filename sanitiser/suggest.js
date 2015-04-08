
var logger = require('../src/logger'),
    _sanitize = require('../sanitiser/_sanitize'),
    sanitizers = {
      input: require('../sanitiser/_input'),
      size: require('../sanitiser/_size'),
      layers: require('../sanitiser/_layers'),
      latlonzoom: function( req ) {
        var geo = require('../sanitiser/_geo');
        return geo(req, true);
      }
    };

var sanitize = function(req, cb) { _sanitize(req, sanitizers, cb); };

// export sanitize for testing
module.exports.sanitize = sanitize;

// middleware
module.exports.middleware = function( req, res, next ){
  sanitize( req, function( err, clean ){
    if( err ){
      res.status(400); // 400 Bad Request
      return next(err);
    }
    req.clean = clean;
    next();
  });
};