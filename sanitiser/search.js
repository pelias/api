var type_mapping = require('../helper/type_mapping');

var sanitizeAll = require('../sanitiser/sanitizeAll'),
    sanitizers = {
      quattroshapes_deprecation: require('../sanitiser/_deprecate_quattroshapes'),
      singleScalarParameters: require('../sanitiser/_single_scalar_parameters'),
      text: require('../sanitiser/_text'),
      size: require('../sanitiser/_size')(/* use defaults*/),
      layers: require('../sanitiser/_targets')('layers', type_mapping.layer_mapping),
      sources: require('../sanitiser/_targets')('sources', type_mapping.source_mapping),
      // depends on the layers and sources sanitisers, must be run after them
      sources_and_layers: require('../sanitiser/_sources_and_layers'),
      private: require('../sanitiser/_flag_bool')('private', false),
      geo_search: require('../sanitiser/_geo_search'),
      boundary_country: require('../sanitiser/_boundary_country'),
      categories: require('../sanitiser/_categories')
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
