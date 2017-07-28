
var sanitizeAll = require('../sanitizer/sanitizeAll'),
    sanitizers = {
      singleScalarParameters: require('../sanitizer/_single_scalar_parameters')(),
      ids: require('../sanitizer/_ids')(),
      private: require('../sanitizer/_flag_bool')('private', false)
    };

var sanitize = sanitizeAll.runAllChecks;

// export sanitize for testing
module.exports.sanitize = sanitize;
module.exports.sanitizer_list = sanitizers;

// middleware
module.exports.middleware = function(req, res, next){
  sanitize(req, sanitizers, ( err, clean ) => {
    if( err ){
      res.status(400); // 400 Bad Request
      return next(err);
    }
    next();
  });
};
