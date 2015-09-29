var logger = require( 'pelias-logger' ).get( 'middleware-500' );

// handle application errors
function middleware(err, req, res, next) {
  logger.error( 'Error: `%s`. Stack trace: `%s`.', err, err.stack );
  res.header('Cache-Control','public');
  var error = (err && err.message) ? err.message : err;

  if( res.statusCode < 400 ){ res.status(500); }
  res.json({ error: typeof error === 'string' ? error : 'internal server error' });
}

module.exports = middleware;
