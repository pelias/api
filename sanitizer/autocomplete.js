var type_mapping = require('../helper/type_mapping');

var sanitizeAll = require('../sanitizer/sanitizeAll'),
    sanitizers = {
      singleScalarParameters: require('../sanitizer/_single_scalar_parameters'),
      text: require('../sanitizer/_text_addressit'),
      tokenizer: require('../sanitizer/_tokenizer'),
      size: require('../sanitizer/_size')(10, 10, 10),
      layers: require('../sanitizer/_targets')('layers', type_mapping.layer_mapping),
      sources: require('../sanitizer/_targets')('sources', type_mapping.source_mapping),
      // depends on the layers and sources sanitizers, must be run after them
      sources_and_layers: require('../sanitizer/_sources_and_layers'),
      private: require('../sanitizer/_flag_bool')('private', false),
      geo_autocomplete: require('../sanitizer/_geo_autocomplete'),
      boundary_country: require('../sanitizer/_boundary_country'),
      categories: require('../sanitizer/_categories')
    };

var sanitize = function(req, cb) { sanitizeAll(req, sanitizers, cb); };

// export sanitize for testing
module.exports.sanitize = sanitize;
module.exports.sanitizer_list = sanitizers;

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
