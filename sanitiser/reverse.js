
var sanitizeAll = require('../sanitiser/sanitizeAll'),
    sanitizers = {
      layers: require('../sanitiser/_targets')('layers', require('../query/layers')),
      sources: require('../sanitiser/_targets')('sources', require('../query/sources')),
      size: require('../sanitiser/_size'),
      private: require('../sanitiser/_flag_bool')('private', false),
      geo_reverse: require('../sanitiser/_geo_reverse'),
      categories: require('../sanitiser/_categories'),
      boundary_country: require('../sanitiser/_boundary_country'),
    };

var sanitize = function(req, cb) { sanitizeAll(req, sanitizers, cb); };

// export sanitize for testing
module.exports.sanitize = sanitize;
module.exports.sanitiser_list = sanitizers;

// middleware
module.exports.middleware = function( req, res, next ){
  sanitize( req, function( err, clean ){
    if( err ){
      res.status(400); // 400 Bad Request
      return next(err);
    }
    next();
  });
};
