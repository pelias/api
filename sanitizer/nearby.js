var sanitizeAll = require('../sanitizer/sanitizeAll');
var type_mapping = require('../helper/type_mapping');

module.exports.middleware = (_api_pelias_config) => {
  // add categories to the sanitizer list
  var sanitizers = {
    singleScalarParameters: require('../sanitizer/_single_scalar_parameters')(),
    debug: require('../sanitizer/_debug')(_api_pelias_config.exposeInternalDebugTools),
    layers: require('../sanitizer/_targets')('layers', type_mapping.layer_mapping),
    sources: require('../sanitizer/_targets')('sources', type_mapping.source_mapping),
    // depends on the layers and sources sanitizers, must be run after them
    sources_and_layers: require('../sanitizer/_sources_and_layers')(),
    geonames_deprecation: require('../sanitizer/_geonames_deprecation')(),
    size: require('../sanitizer/_size')(/* use defaults*/),
    private: require('../sanitizer/_flag_bool')('private', false),
    geo_reverse: require('../sanitizer/_geo_reverse')(),
    boundary_country: require('../sanitizer/_boundary_country')(),
    categories: require('../sanitizer/_categories')(),
    request_language: require('../sanitizer/_request_language')()
  };

  return function( req, res, next ){
    sanitizeAll.runAllChecks(req, sanitizers);
    next();
  };
};