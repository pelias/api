
var isObject = require('is-object');

// validate inputs, convert types and apply defaults
function sanitize( req ){

  var clean = req.clean || {};
  var params= req.query;

  // ensure the input params are a valid object
  if( !isObject( params ) ){
    params = {};
  }

  // default case (no categories specified in GET params)
  if('string' !== typeof params.categories || !params.categories.length){
    clean.categories = [];
  }
  else {
    // parse GET params
    clean.categories = params.categories.split(',')
      .map(function (cat) {
        return cat.toLowerCase().trim(); // lowercase inputs
      })
      .filter( function( cat ) {
        return ( cat.length > 0 );
      });
  }

  // pass validated params to next middleware
  req.clean = clean;

  return { 'error': false };

}

// export function
module.exports = sanitize;
