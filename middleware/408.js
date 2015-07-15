
// handle time out errors
function middleware(err, req, res, next) {
  res.header('Cache-Control','no-cache');
  var error = err.message ? err.message : err;
  
  if( res.statusCode === 408 || (error.toLowerCase().indexOf('request timeout') !== -1) ){ 
  	res.status(408); 
  	res.json({ error: error === 'string' ? error : 'request time out' });
  } else {
  	next(err);
  }
}

module.exports = middleware;