var type_mapping = require('../helper/type_mapping');

var sanitizeAll = require('../sanitiser/sanitizeAll'),
    sanitizers = {
      singleScalarParameters: require('../sanitiser/_single_scalar_parameters'),
      text: require('../sanitiser/_text'),
      size: require('../sanitiser/_size'),
      layers: require('../sanitiser/_targets')('layers', type_mapping.layer_with_aliases_to_type),
      sources: require('../sanitiser/_targets')('sources', type_mapping.source_to_type),
      quattroshapes_warning: require('../sanitiser/_warn_quattroshapes')(),
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
