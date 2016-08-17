var sanitizeAll = require('../sanitiser/sanitizeAll'),
    sanitizers = {
      text: require('../sanitiser/_text_autocomplete')
    };

var sanitize = function(req, cb) { sanitizeAll(req, sanitizers, cb); };

// middleware
module.exports.middleware = function( req, res, next ){
  sanitize( req, function( err, clean ){
    next();
  });
};
