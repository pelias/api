var check = require('check-types'),
    logger = require( 'pelias-logger' ).get( 'api' );

// handle application errors
function middleware(err, req, res, next) {

  logger.error( 'Error: `%s`. Stack trace: `%s`.', err, err.stack );

  if( res.statusCode < 400 ){
    logger.info( 'status code changed from', res.statusCode, 'to 500' );
    res.status(500);
  }

  var error = ( err && err.message ) ? err.message : err;
  res.header('Cache-Control','public');
  res.json({ error: check.nonEmptyString( error ) ? error : 'internal server error' });
}

module.exports = middleware;
