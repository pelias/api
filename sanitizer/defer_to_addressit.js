const sanitizeAll = require('../sanitizer/sanitizeAll'),
    sanitizers = {
      debug: require('../sanitizer/_debug')(),
      text: require('../sanitizer/_text_addressit')()
    };

const logger = require('pelias-logger').get('api');
const logging = require( '../helper/logging' );

// middleware
module.exports = (should_execute) => {
  return function(req, res, next) {
    // if res.data already has results then don't call the _text_autocomplete sanitizer
    // this has been put into place for when the libpostal integration way of querying
    // ES doesn't return anything and we want to fallback to the old logic
    if (!should_execute(req, res)) {
      return next();
    }

    // log the query that caused a fallback since libpostal+new-queries didn't return anything
    if (req.path === '/v1/search') {
      const queryText = logging.isDNT(req) ? '[text removed]' : req.clean.text;
      logger.info(`fallback queryText: ${queryText}`);
    }

    sanitizeAll.sanitize(req, sanitizers);
    next();

  };

};
