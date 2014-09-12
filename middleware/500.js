
// handle application errors
function middleware(err, req, res, next) {
  res.header('Cache-Control','no-cache');
  if( res.statusCode < 400 ){ res.status(500); }
  res.json({ error: err });
}

module.exports = middleware;