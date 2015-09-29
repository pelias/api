
// handle time out errors
function middleware(err, req, res, next) {
  res.header('Cache-Control','public');
  var error = (err && err.message) ? err.message : err;
  
  if( res.statusCode === 408 || (error.toLowerCase().indexOf('request timeout') !== -1) ){ 
  	res.status(408); 
  	res.json({ error: typeof error === 'string' ? error : 'request timeout' });
  } else {
  	next(err);
  }
}

module.exports = middleware;