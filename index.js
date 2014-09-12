
var pkg = require('./package'),
    app = require('express')();

/** ----------------------- middleware ----------------------- **/

// generic headers
app.use(function(req, res, next){
  res.header('Charset','utf8');
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET');
  res.header('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Server', 'Pelias/'+pkg.version);
  res.header('X-Powered-By', 'mapzen');
  next();
});

// jsonp middleware
// override json() to handle jsonp
app.use(function(req, res, next){

  res._json = res.json;
  res.json = function( data ){

    // jsonp
    if( req.query && req.query.callback ){
      res.header('Content-type','application/javascript');
      return res.send( req.query.callback + '('+ JSON.stringify( data ) + ');' );
    }

    // regular json
    res.header('Content-type','application/json');
    return res._json( data );
  };

  next();
});

// enable client-side caching of 60s by default
app.use(function(req, res, next){
  res.header('Cache-Control','public,max-age=60');
  next();
});

/** ----------------------- Routes ----------------------- **/

// api root
app.get( '/', require('./controller/index') );

// suggest API
app.get( '/suggest', require('./sanitiser/suggest'), require('./controller/suggest') );

/** ----------------------- error middleware ----------------------- **/

// handle application errors
app.use( require('./middleware/404') );
app.use( require('./middleware/500') );

app.listen( process.env.PORT || 3100 );