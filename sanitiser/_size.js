// validate inputs, convert types and apply defaults
function sanitize( req, default_size){
  
  var clean = req.clean || {};
  var params= req.query;

  var default_size = default_size || 10;

  // ensure the input params are a valid object
  if( Object.prototype.toString.call( params ) !== '[object Object]' ){
    params = {};
  }

  // total results
  var size = parseInt( params.size, 10 );
  if( !isNaN( size ) ){
    clean.size = Math.min( Math.max( size, 1 ), 40 ); // max
  } else {
    clean.size = default_size; // default
  }

  req.clean = clean;
  
  return {'error':false};

}

// export function
module.exports = sanitize;
