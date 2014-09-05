
var express = require('express');
var app = express();

// enable client-side caching of 60s by default
app.use(function(req, res, next){
  res.header('Cache-Control','public,max-age=60');
  next();
});

module.exports = app;