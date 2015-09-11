var _sanitize = require('../sanitiser/_sanitize');

var sanitiser = {
  latlonzoom: require('../sanitiser/_geo_reverse'),
  layers: require('../sanitiser/_targets')('layers', require('../query/layers')),
  sources: require('../sanitiser/_targets')('sources', require('../query/sources')),
  details: require('../sanitiser/_details'),
  size: require('../sanitiser/_size'),
  categories: function (req) {
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

module.exports.sanitiser_list = sanitiser;
