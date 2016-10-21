var sanitizeAll = require('../sanitizer/sanitizeAll'),
    sanitizers = {
      text: require('../sanitizer/_text_addressit')
    };

var sanitize = function(req, cb) { sanitizeAll(req, sanitizers, cb); };
var logger = require('pelias-logger').get('api:controller:search_fallback');
var logging = require( '../helper/logging' );

// middleware
module.exports.middleware = function( req, res, next ){
  // if res.data already has results then don't call the _text_autocomplete sanitizer
  // this has been put into place for when the libpostal integration way of querying
  // ES doesn't return anything and we want to fallback to the old logic
  if (res && res.hasOwnProperty('data') && res.data.length > 0) {
    return next();
  }

  // log the query that caused a fallback since libpostal+new-queries didn't return anything
  if (req.path === '/v1/search') {
    var queryText = logging.isDNT(req) ? '[text removed]' : req.clean.text;
    logger.info(queryText);
  }

  sanitize( req, function( err, clean ){
    next();
  });

};
