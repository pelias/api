
// middleware which blocks requests when the eventloop is too busy
var toobusy = require('toobusy');

function middleware(req, res, next){
  if( toobusy() ){
    res.status(503); // Service Unavailable
    return next('Server Overwhelmed');
  }
  return next();
}

// calling .shutdown allows your process to exit normally
process.on('SIGINT', function() {
  toobusy.shutdown();
  process.exit();
});

module.exports = middleware;