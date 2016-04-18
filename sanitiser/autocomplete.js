var type_mapping = require('../helper/type_mapping');

var sanitizeAll = require('../sanitiser/sanitizeAll'),
    sanitizers = {
      singleScalarParameters: require('../sanitiser/_single_scalar_parameters'),
      text: require('../sanitiser/_text'),
      size: require('../sanitiser/_size')(10, 10, 10),
      lang: require('../sanitiser/_lang'),
      layers: require('../sanitiser/_targets')('layers', type_mapping.layer_mapping),
      sources: require('../sanitiser/_targets')('sources', type_mapping.source_mapping),
      // depends on the layers and sources sanitisers, must be run after them
      sources_and_layers: require('../sanitiser/_sources_and_layers'),
      private: require('../sanitiser/_flag_bool')('private', false),
      geo_autocomplete: require('../sanitiser/_geo_autocomplete'),
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
