var logger = require( '../src/logger' );

// handle application errors
function middleware(err, req, res, next) {
  logger.error( 'Error:', err );
  logger.error( 'Stack trace:', err.trace );
  res.header('Cache-Control','no-cache');
  if( res.statusCode < 400 ){ res.status(500); }
  res.json({ error: err.toString() });
}

module.exports = middleware;
