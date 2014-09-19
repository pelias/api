var indeces = require('../query/indeces');

// validate inputs, convert types and apply defaults
function sanitize( req ){
  
  var clean = req.clean || {};
  var params= req.query;

  // ensure the input params are a valid object
  if( Object.prototype.toString.call( params ) !== '[object Object]' ){
    params = {};
  }

  // which layers to query
  if('string' === typeof params.layers && params.layers.length){
    var layers = params.layers.split(',').map( function( layer ){
      return layer.toLowerCase(); // lowercase inputs
    });
    for( var x=0; x<layers.length; x++ ){
      if( -1 === indeces.indexOf( layers[x] ) ){
        return {
          'error': true,
          'message': 'invalid param \'layer\': must be one or more of ' + indeces.join(',') 
        }
      }
    }
    clean.layers = layers;
  }
  else {
    clean.layers = indeces; // default (all layers)
  }

  req.clean = clean;
  
  return { 'error': false };

}

// export function
module.exports = sanitize;
