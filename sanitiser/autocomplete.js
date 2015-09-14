var sanitizeAll = require('../sanitiser/sanitizeAll'),
    sanitizers = {
      text: require('../sanitiser/_text'),
      size: require('../sanitiser/_size'),
      private: require('../sanitiser/_flag_bool')('private', false),
      geo_autocomplete: require('../sanitiser/_geo_autocomplete'),
    };

var sanitize = function(req, cb) { sanitizeAll(req, sanitizers, cb); };

// export sanitize for testing
module.exports.sanitize = sanitize;
module.exports.sanitiser_list = sanitizers;

// middleware
module.exports.middleware = function( req, res, next ){
  sanitize( req, function( err, clean ){
    if( err ){
      res.status(400); // 400 Bad Request
      return next(err);
    }
    next();
  });
};
