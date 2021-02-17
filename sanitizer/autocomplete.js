var type_mapping = require('../helper/type_mapping');
var sanitizeAll = require('../sanitizer/sanitizeAll');

// middleware
module.exports.middleware = (_api_pelias_config) => {
  var sanitizers = {
      singleScalarParameters: require('../sanitizer/_single_scalar_parameters')(),
      debug: require('../sanitizer/_debug')(_api_pelias_config.exposeInternalDebugTools),
      text: require('../sanitizer/_text_pelias_parser')(),
      size: require('../sanitizer/_size')(/* use defaults*/),
      layers: require('../sanitizer/_targets')('layers', type_mapping.layer_mapping),
      sources: require('../sanitizer/_targets')('sources', type_mapping.source_mapping),
      address_layer_filter: require('../sanitizer/_address_layer_filter')(type_mapping),
      tokenizer: require('../sanitizer/_tokenizer')(),
      // depends on the layers and sources sanitizers, must be run after them
      sources_and_layers: require('../sanitizer/_sources_and_layers')(),
      private: require('../sanitizer/_flag_bool')('private', false),
      location_bias: require('../sanitizer/_location_bias')(_api_pelias_config.defaultParameters),
      geo_autocomplete: require('../sanitizer/_geo_autocomplete')(),
      boundary_country: require('../sanitizer/_boundary_country')(),
      categories: require('../sanitizer/_categories')(),
      request_language: require('../sanitizer/_request_language')(),
      boundary_gid: require('../sanitizer/_boundary_gid')()
    };

  return ( req, res, next ) => {
    sanitizeAll.runAllChecks(req, sanitizers);
    next();
  };
};
