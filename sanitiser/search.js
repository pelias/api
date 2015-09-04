
var _sanitize = require('../sanitiser/_sanitize'),
    sanitizers = {
      text: require('../sanitiser/_text'),
      size: require('../sanitiser/_size'),
      layers: require('../sanitiser/_layers'),
      source: require('../sanitiser/_source'),
      details: require('../sanitiser/_details'),
      latlonzoom: require('../sanitiser/_geo_search')
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
