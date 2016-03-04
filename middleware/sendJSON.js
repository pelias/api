var check = require('check-types');
var iterate = require('../helper/iterate');

function sendJSONResponse(req, res, next) {

  // do nothing if no result data set
  if (!res || !check.object(res.body)) {
    return next();
  }

  // default status
  var statusCode = 200;

  iterate(res.body, function(body) {
    // vary status code whenever an error was reported
    if( check.array( body.geocoding.errors ) && body.geocoding.errors.length ){

      // default status for errors is 400 Bad Request
      statusCode = 400; // 400 Bad Request

      // iterate over all reported errors
      body.geocoding.errors.forEach( function( err ){
        // custom status codes for instances of the Error() object.
        if( err instanceof Error ){
          // we can extract the error type from the constructor name
          switch( err.constructor.name ){
            // elasticsearch errors
            // see: https://github.com/elastic/elasticsearch-js/blob/master/src/lib/errors.js
            case 'RequestTimeout': statusCode = 408; break; // 408 Request Timeout
            case 'NoConnections': statusCode = 502; break; // 502 Bad Gateway
            case 'ConnectionFault': statusCode = 502; break; // 502 Bad Gateway
            case 'Serialization': statusCode = 500; break; // 500 Internal Server Error
            case 'Generic': statusCode = 500; break; // 500 Internal Server Error
            default: statusCode = 500; // 500 Internal Server Error
          }
        }
      });

      // No need to look for further errors. End the iteration.
      return false;
    }
  });

  // respond
  return res.status(statusCode).json(res.body);
}

module.exports = sendJSONResponse;
