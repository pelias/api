var sanitizeAll = require('../sanitizer/sanitizeAll');
var type_mapping = require('../helper/type_mapping');

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
  ['size'],
  ['sources'],
  ['layers'],
  ['point.lon', 'point.lat'],
  ['boundary.circle.radius'],
  ['boundary.country'],
  ['categories']
];

module.exports.middleware = (_api_pelias_config) => {
  var sanitizers = {
    defaultParameters: require('../sanitizer/_default_parameters')(_api_pelias_config.defaultParameters, paramGroups),
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
    boundary_country: require('../sanitizer/_countries')('boundary'),
    request_language: require('../sanitizer/_request_language')(),
    boundary_gid: require('../sanitizer/_boundary_gid')()
  };

  // middleware
  return function( req, res, next ){
    sanitizeAll.runAllChecks(req, sanitizers);
    next();
  };
};
