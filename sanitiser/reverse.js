
var type_mapping = require('../helper/type_mapping');
var sanitizeAll = require('../sanitiser/sanitizeAll'),
    sanitizers = {
      singleScalarParameters: require('../sanitiser/_single_scalar_parameters'),
      layers: require('../sanitiser/_targets')('layers', type_mapping.layer_mapping),
      sources: require('../sanitiser/_targets')('sources', type_mapping.source_mapping),
      // depends on the layers and sources sanitisers, must be run after them
      sources_and_layers: require('../sanitiser/_sources_and_layers'),
      size: require('../sanitiser/_size'),
      private: require('../sanitiser/_flag_bool')('private', false),
      geo_reverse: require('../sanitiser/_geo_reverse'),
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
