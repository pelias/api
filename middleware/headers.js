var pkg = require('../package');

function middleware(req, res, next){
  res.header('Charset','utf8');
  res.header('Cache-Control','public');
  res.header('Server', 'Pelias/'+pkg.version);
  res.header('X-Powered-By', 'pelias');
  next();
}

module.exports = middleware;
