
// handle time out errors
function middleware(err, req, res, next) {
  res.header('Cache-Control','no-cache');
  if( res.statusCode === 408 ){ 
  	res.status(408); 
  	res.json({ error: err && typeof err.message === 'string' ? err.message : 'request time out' });
  } else {
  	next(err);
  }
}

module.exports = middleware;