var check = require('check-types'),
    es = require('elasticsearch'),
    logger = require( 'pelias-logger' ).get( 'api' ),
    exceptions = require('elasticsearch-exceptions/lib/exceptions/SupportedExceptions');

// create a list of regular expressions to match against.
// note: list created when the server starts up; for performance reasons.
var exceptionRegexList = exceptions.map( function( exceptionName ){
  return new RegExp( '^' + exceptionName );
});

function sendJSONResponse(req, res, next) {

  // do nothing if no result data set
  if (!res || !check.object(res.body) || !check.object(res.body.geocoding)) {
    return next();
  }

  // default status
  var statusCode = 200; // 200 OK

  // vary status code whenever an error was reported
  var geocoding = res.body.geocoding;

  if( check.array( geocoding.errors ) && geocoding.errors.length ){

    // default status for errors is 400 Bad Request
    statusCode = 400; // 400 Bad Request

    // iterate over all reported errors
    geocoding.errors.forEach( function( err ){

      // custom status codes for instances of the Error() object.
      if( err instanceof Error ){
        /*
          elasticsearch errors
          see: https://github.com/elastic/elasticsearch-js/blob/master/src/lib/errors.js

          408 Request Timeout
          500 Internal Server Error
          502 Bad Gateway
        */
        if( err instanceof es.errors.RequestTimeout ){ statusCode = Math.max( statusCode, 408 ); }
        else if( err instanceof es.errors.NoConnections ){ statusCode = Math.max( statusCode, 502 ); }
        else if( err instanceof es.errors.ConnectionFault ){ statusCode = Math.max( statusCode, 502 ); }
        else {
          logger.warn( 'unknown geocoding error object:', err.constructor.name, err );
          statusCode = Math.max( statusCode, 500 );
        }

      /*
        some elasticsearch errors are only returned as strings (not instances of Error).
        in this case we (unfortunately) need to match the exception at position 0 inside the string.
      */
      } else if( check.string( err ) ){
        for( var i=0; i<exceptionRegexList.length; i++ ){
          // check error string against a list of known elasticsearch exceptions
          if( err.match( exceptionRegexList[i] ) ){
            statusCode = Math.max( statusCode, 500 );
            break; // break on first match
          }
          logger.warn( 'unknown geocoding error string:', err );
        }
      } else {
        logger.warn( 'unknown geocoding error type:', typeof err, err );
      }
    });
  }

  // respond
  return res.status(statusCode).json(res.body);
}

module.exports = sendJSONResponse;
