var type_mapping = require('../helper/type_mapping');
var sanitizeAll = require('../sanitizer/sanitizeAll');

// middleware
module.exports.middleware = (_api_pelias_config) => {
  var sanitizers = {
        singleScalarParameters: require('../sanitizer/_single_scalar_parameters')(),
        debug: require('../sanitizer/_debug')(),
        quattroshapes_deprecation: require('../sanitizer/_deprecate_quattroshapes')(),
        synthesize_analysis: require('../sanitizer/_synthesize_analysis')(),
        iso2_to_iso3: require('../sanitizer/_iso2_to_iso3')(),
        city_name_standardizer: require('../sanitizer/_city_name_standardizer')(),
        size: require('../sanitizer/_size')(/* use defaults*/),
        layers: require('../sanitizer/_targets')('layers', type_mapping.layer_mapping),
        sources: require('../sanitizer/_targets')('sources', type_mapping.source_mapping),
        // depends on the layers and sources sanitizers, must be run after them
        sources_and_layers: require('../sanitizer/_sources_and_layers')(),
        private: require('../sanitizer/_flag_bool')('private', false),
        location_bias: require('../sanitizer/_location_bias')(_api_pelias_config.defaultParameters),
        geo_search: require('../sanitizer/_geo_search')(),
        boundary_country: require('../sanitizer/_boundary_country')(),
        categories: require('../sanitizer/_categories')()
      };

  return ( req, res, next ) => {
    sanitizeAll.runAllChecks(req, sanitizers);
    next();

  };

};
