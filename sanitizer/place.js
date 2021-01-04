module.exports.middleware = (_api_pelias_config) => {
  var sanitizeAll = require('../sanitizer/sanitizeAll'),
      sanitizers = {
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