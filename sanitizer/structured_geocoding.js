var type_mapping = require('../helper/type_mapping');
var sanitizeAll = require('../sanitizer/sanitizeAll');

/**
 * a list of query-string parameters groups for this endpoint
 * which will be replaced with default values if unset.
 *
 * note: all parameters in each group MUST be unset in the req
 * and a replacement available in the defaults for them to be replaced.
 *
 * the idea being that it makes sense for some parameters to be
 * treated as a cohesive group (such as lat/lon pairs), if one or
 * the other is missing then we don't make modifications.
 */
const paramGroups = [
  ['address'],
  ['neighbourhood'],
  ['borough'],
  ['locality'],
  ['county'],
  ['region'],
  ['postalcode'],
  ['country'],
  ['size'],
  ['sources'],
  ['layers'],
  ['focus.point.lon', 'focus.point.lat'],
  ['boundary.rect.min_lon', 'boundary.rect.max_lon', 'boundary.rect.min_lat', 'boundary.rect.max_lat'],
  ['boundary.circle.lon', 'boundary.circle.lat'],
  ['boundary.circle.radius'],
  ['boundary.country'],
  ['boundary.gid']
];

// middleware
module.exports.middleware = (_api_pelias_config) => {
  var sanitizers = {
        defaultParameters: require('../sanitizer/_default_parameters')(_api_pelias_config.defaultParameters, paramGroups),
        singleScalarParameters: require('../sanitizer/_single_scalar_parameters')(),
        debug: require('../sanitizer/_debug')(_api_pelias_config.exposeInternalDebugTools),
        synthesize_analysis: require('../sanitizer/_synthesize_analysis')(),
        iso2_to_iso3: require('../sanitizer/_iso2_to_iso3')(),
        city_name_standardizer: require('../sanitizer/_city_name_standardizer')(),
        size: require('../sanitizer/_size')(/* use defaults*/),
        layers: require('../sanitizer/_targets')('layers', type_mapping.layer_mapping),
        sources: require('../sanitizer/_targets')('sources', type_mapping.source_mapping),
        // depends on the layers and sources sanitizers, must be run after them
        sources_and_layers: require('../sanitizer/_sources_and_layers')(),
        private: require('../sanitizer/_flag_bool')('private', false),
        geo_search: require('../sanitizer/_geo_search')(),
        boundary_country: require('../sanitizer/_countries')('boundary'),
        categories: require('../sanitizer/_categories')(),
        request_language: require('../sanitizer/_request_language')(),
        boundary_gid: require('../sanitizer/_boundary_gid')()
      };

  return ( req, res, next ) => {
    sanitizeAll.runAllChecks(req, sanitizers);
    next();

  };

};
