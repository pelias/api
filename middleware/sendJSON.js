var check = require('check-types'),
    es = require('elasticsearch');

function sendJSONResponse(req, res, next) {

  // do nothing if no result data set
  if (!res || !check.object(res.body) || !check.object(res.body.geocoding)) {
    return next();
  }

  // default status
  var statusCode = 200;

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
        if( err instanceof es.errors.RequestTimeout ){ statusCode = 408; }
        else if( err instanceof es.errors.NoConnections ){ statusCode = 502; }
        else if( err instanceof es.errors.ConnectionFault ){ statusCode = 502; }
        else { statusCode = 500; }
      }
    });
  }

  // respond
  return res.status(statusCode).json(res.body);
}

module.exports = sendJSONResponse;
