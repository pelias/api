
// send a reply that is capable of JSON, CORS and JSONP
function cors( req, res, obj ){
  res.header('Charset','utf8');
  res.header('Cache-Control','public,max-age=60');
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET');
  res.header('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.header('Access-Control-Allow-Credentials', true);
  res.header('X-Powered-By', 'pelias');

  // jsonp
  if( req.query && req.query.callback ){
    res.header('Content-type','application/javascript');
    return res.send( req.query.callback + '('+ JSON.stringify( obj ) + ');' );
  }

  // regular json
  res.header('Content-type','application/json');
  return res.json( obj );
}

// send an error
function error( req, res, next, err ){
  console.error( 'application error:', err );
  // mask error from user (contains paths)
  return cors( req, res, { error: 'application error' } );
}

module.exports = {
  cors: cors,
  error: error
};