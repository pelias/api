
var express = require('express'),
    app = express();

// middleware modules
// app.use( require('cookie-parser')() );

// enable client-side caching of 60s by default
app.use(function(req, res, next){
  res.header('Cache-Control','public,max-age=60');
  next();
});

module.exports = app;