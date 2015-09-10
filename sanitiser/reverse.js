var _sanitize = require('../sanitiser/_sanitize'),
    sanitiser = {
      latlonzoom: require('../sanitiser/_geo_reverse'),
      layers: require('../sanitiser/_layers'),
      details: require('../sanitiser/_details'),
      size: require('../sanitiser/_size'),
      categories: function ( req ) {
        var categories = require('../sanitiser/_categories');
        return categories(req);
      }
    };

var sanitize = function(req, cb) { _sanitize(req, sanitiser, cb); };

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
