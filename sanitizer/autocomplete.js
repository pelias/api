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
  ['text'],
  ['size'],
  ['sources'],
  ['layers'],
  ['focus.point.lon', 'focus.point.lat'],
  ['boundary.rect.min_lon', 'boundary.rect.max_lon', 'boundary.rect.min_lat', 'boundary.rect.max_lat'],
  ['boundary.circle.lon', 'boundary.circle.lat'],
  ['boundary.circle.radius'],
  ['boundary.country'],
  ['boundary.gid'],
  ['focus.country'],
  ['focus.gid']
];

// middleware
module.exports.middleware = (_api_pelias_config) => {
  var sanitizers = {
      defaultParameters: require('../sanitizer/_default_parameters')(_api_pelias_config.defaultParameters, paramGroups),
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
      geo_autocomplete: require('../sanitizer/_geo_autocomplete')(),
      boundary_country: require('../sanitizer/_countries')('boundary'),
      focus_country: require('../sanitizer/_countries')('focus'),
      categories: require('../sanitizer/_categories')(),
      request_language: require('../sanitizer/_request_language')(),
      boundary_gid: require('../sanitizer/_gids')('boundary'),
      focus_gid: require('../sanitizer/_gids')('focus')
    };

  return ( req, res, next ) => {
    sanitizeAll.runAllChecks(req, sanitizers);
    next();
  };
};
