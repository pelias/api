/**
 * Create a middleware that prints access logs via pelias-logger.
 */

'use strict';

var url = require( 'url' );

var _ = require( 'lodash' );
var morgan = require( 'morgan' );
var through = require( 'through2' );

var peliasLogger = require( 'pelias-logger' ).get( 'api' );
var logging = require( '../helper/logging' );

function customRemoteAddr(req, res) {
  if (logging.isDNT(req)) {
    return '[IP removed]';
  } else {
    // from morgan default implementation
    return req.ip ||
      req._remoteAddress ||
      (req.connection && req.connection.remoteAddress) ||
      undefined;
  }
}

function customURL(req, res) {
  var parsedUrl = _.cloneDeep(req._parsedUrl);
  parsedUrl.query = _.cloneDeep(req.query);

  if (logging.isDNT(req)) {
    // strip out sensitive fields in the query object
    parsedUrl.query = logging.removeFields(parsedUrl.query);

    // search will override the query object when formatting the url
    // see https://nodejs.org/api/all.html#all_url_format_urlobj
    delete parsedUrl.search;
  }

  return url.format(parsedUrl);
}

function createAccessLogger( logFormat ){
  morgan.token('remote-addr', customRemoteAddr);
  morgan.token('url', customURL);

  return morgan( logFormat, {
    stream: through( function write( ln, _, next ){
      peliasLogger.info( ln.toString().trim() );
      next();
    })
  });
}

module.exports = {
  customRemoteAddr: customRemoteAddr,
  customURL: customURL,
  createAccessLogger: createAccessLogger
};
