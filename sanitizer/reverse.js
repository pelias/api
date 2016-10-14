
var type_mapping = require('../helper/type_mapping');
var sanitizeAll = require('../sanitizer/sanitizeAll'),
    sanitizers = {
      quattroshapes_deprecation: require('../sanitizer/_deprecate_quattroshapes'),
      singleScalarParameters: require('../sanitizer/_single_scalar_parameters'),
      layers: require('../sanitizer/_targets')('layers', type_mapping.layer_mapping),
      sources: require('../sanitizer/_targets')('sources', type_mapping.source_mapping),
      // depends on the layers and sources sanitizers, must be run after them
      sources_and_layers: require('../sanitizer/_sources_and_layers'),
      size: require('../sanitizer/_size')(/* use defaults*/),
      private: require('../sanitizer/_flag_bool')('private', false),
      geo_reverse: require('../sanitizer/_geo_reverse'),
      boundary_country: require('../sanitizer/_boundary_country')
    };

var sanitize = function(req, cb) { sanitizeAll(req, sanitizers, cb); };

// export sanitize for testing
module.exports.sanitize = sanitize;
module.exports.sanitizer_list = sanitizers;

// middleware
module.exports.middleware = function( req, res, next ){
  sanitize( req, function( err, clean ){
    next();
  });
};
