var type_mapping = require('../helper/type_mapping');
var sanitizeAll = require('../sanitizer/sanitizeAll');

// middleware
module.exports.middleware = (_api_pelias_config) => {
  var sanitizers = {
      singleScalarParameters: require('../sanitizer/_single_scalar_parameters')(),
      debug: require('../sanitizer/_debug')(),
      text: require('../sanitizer/_text_addressit')(),
      tokenizer: require('../sanitizer/_tokenizer')(),
      size: require('../sanitizer/_size')(1, 100, 10),
      layers: require('../sanitizer/_targets')('layers', type_mapping.layer_mapping),
      sources: require('../sanitizer/_targets')('sources', type_mapping.source_mapping),
      // depends on the layers and sources sanitizers, must be run after them
      sources_and_layers: require('../sanitizer/_sources_and_layers')(),
      private: require('../sanitizer/_flag_bool')('private', false),
      location_bias: require('../sanitizer/_location_bias')(_api_pelias_config.defaultParameters),
      geo_autocomplete: require('../sanitizer/_geo_autocomplete')(),
      boundary_country: require('../sanitizer/_boundary_country')(),
      boundary_county_ids: require('../sanitizer/_boundary_county_ids')(),
      boundary_locality_ids: require('../sanitizer/_boundary_locality_ids')(),
      tariff_zone_ids: require('../sanitizer/_tariff_zone_ids')(),
      tariff_zone_authorities: require('../sanitizer/_tariff_zone_authorities')(),
      categories: require('../sanitizer/_categories')(),
      request_language: require('../sanitizer/_request_language')()
    };

  return ( req, res, next ) => {
    sanitizeAll.runAllChecks(req, sanitizers);
    next();
  };
};
