
// handle time out errors
function middleware(err, req, res, next) {
  res.header('Cache-Control','no-cache');
  if( res.statusCode === 408 ){ res.status(408); }
  res.json({ error: typeof err === 'string' ? err : 'request time out' });
}

module.exports = middleware;