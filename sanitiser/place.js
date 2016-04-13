

var sanitizeAll = require('../sanitiser/sanitizeAll'),
    sanitizers = {
      singleScalarParameters: require('../sanitiser/_single_scalar_parameters'),
      ids: require('../sanitiser/_ids'),
      private: require('../sanitiser/_flag_bool')('private', false)
    };

var sanitize = function(req, cb) { sanitizeAll(req, sanitizers, cb); };

// export sanitize for testing
module.exports.sanitize = sanitize;
module.exports.sanitiser_list = sanitizers;

// middleware
module.exports.middleware = function( req, res, next ){
  sanitize( req, function( err, clean ){
    next();
  });
};
