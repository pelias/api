
/**
  this functionality is required by CORS as the browser will send an
  HTTP OPTIONS request before performing the CORS request.

  if the OPTIONS request returns a non-200 status code then the 
  transaction will fail.
**/

function middleware(req, res, next){
  if( req.method === 'OPTIONS' ){
    res.sendStatus(200);
  } else {
    next();
  }
}

module.exports = middleware;
