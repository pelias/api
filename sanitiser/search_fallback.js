var sanitizeAll = require('../sanitiser/sanitizeAll'),
    sanitizers = {
      text: require('../sanitiser/_text_autocomplete')
    };

var sanitize = function(req, cb) { sanitizeAll(req, sanitizers, cb); };

// middleware
module.exports.middleware = function( req, res, next ){
  // if res.data already has results then don't call the _text_autocomplete sanitiser
  // this has been put into place for when the libpostal integration way of querying
  // ES doesn't return anything and we want to fallback to the old logic
  if (res && res.hasOwnProperty('data') && res.data.length > 0) {
    return next();
  }

  sanitize( req, function( err, clean ){
    next();
  });

};
