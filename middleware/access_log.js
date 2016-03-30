/**
 * Create a middleware that prints access logs via pelias-logger.
 */

'use strict';

var morgan = require( 'morgan' );
var through = require( 'through2' );
var peliasLogger = require( 'pelias-logger' ).get( 'api' );

function createAccessLogger( logFormat ){
  return morgan( logFormat, {
    stream: through( function write( ln, _, next ){
      peliasLogger.info( ln.toString().trim() );
      next();
    })
  });
}

module.exports = {
  createAccessLogger: createAccessLogger
};
