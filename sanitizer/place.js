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
  ['gid'],
  ['categories']
];

module.exports.middleware = (_api_pelias_config) => {
  var sanitizers = {
    defaultParameters: require('../sanitizer/_default_parameters')(_api_pelias_config.defaultParameters, paramGroups),
    singleScalarParameters: require('../sanitizer/_single_scalar_parameters')(),
    debug: require('../sanitizer/_debug')(_api_pelias_config.exposeInternalDebugTools),
    ids: require('../sanitizer/_ids')(),
    private: require('../sanitizer/_flag_bool')('private', false),
    categories: require('../sanitizer/_categories')(true),
    request_language: require('../sanitizer/_request_language')()
  };

  return function(req, res, next){
    sanitizeAll.runAllChecks(req, sanitizers);
    next();
  };
};
