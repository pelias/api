
function middleware(req, res, next){

  // store old json function
  var json = res.json.bind(res);

  // replace with jsonp aware function
  res.json = function( data ){

    // jsonp
    if( req.query && req.query.callback ){
      res.header('Content-type','application/javascript');
      return res.send( req.query.callback + '('+ JSON.stringify( data ) + ');' );
    }

    // regular json
    res.header('Content-type','application/json');
    return json( data );
  };

  next();
}

module.exports = middleware;