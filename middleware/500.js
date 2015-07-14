var logger = require( 'pelias-logger' ).get( 'middleware-500' );

// handle application errors
function middleware(err, req, res, next) {
  logger.error( 'Error: `%s`. Stack trace: `%s`.', err, err.stack );
  res.header('Cache-Control','no-cache');
  if( res.statusCode < 400 ){ res.status(500); }
  res.json({ error: err && typeof err.message === 'string' ? err.message : 'internal server error' });
}

module.exports = middleware;
