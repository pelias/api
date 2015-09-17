
var sanitizeAll = require('../sanitiser/sanitizeAll'),
    sanitizers = {
      text: require('../sanitiser/_text'),
      size: require('../sanitiser/_size'),
      layers: require('../sanitiser/_targets')('layers', require( '../query/layers' )),
      sources: require('../sanitiser/_targets')('sources', require( '../query/sources' )),
      private: require('../sanitiser/_flag_bool')('private', false),
      geo_search: require('../sanitiser/_geo_search'),
      boundary_country: require('../sanitiser/_boundary_country'),
    };

var sanitize = function(req, cb) { sanitizeAll(req, sanitizers, cb); };

// export sanitize for testing
module.exports.sanitize = sanitize;
module.exports.sanitiser_list = sanitizers;

// middleware
module.exports.middleware = function( req, res, next ){
  sanitize( req, function( err, clean ){
    next();
  });
};
