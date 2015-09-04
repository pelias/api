
var isObject = require('is-object'),
    types = require('../query/types'),
    get_layers = require('../helper/layers');

// validate inputs, convert types and apply defaults
function sanitize( req ){
  var clean = req.clean || {};
  var params= req.query;

  clean.types = clean.types || {};

  // ensure the input params are a valid object
  if( !isObject( params ) ){
    params = {};
  }

  // default case (no layers specified in GET params)
  // don't even set the from_layers key in this case
  if('string' !== typeof params.layers || !params.layers.length){
    return { 'error': false };
  }

  // decide which layers can be queried
  var alias_layers  = ['poi', 'admin', 'address'];
  var alias_types = types.concat(alias_layers);

  // parse GET params
  var layers = params.layers.split(',').map( function( layer ){
    return layer.toLowerCase(); // lowercase inputs
  });

  // validate layer names
  for( var x=0; x<layers.length; x++ ){
    if( -1 === alias_types.indexOf( layers[x] ) ){
      return {
        'error': true,
        'message': 'invalid param \'layers\': must be one or more of ' + alias_types.join(',')
      };
    }
  }

  // pass validated params to next middleware
  clean.types.from_layers = get_layers(layers);
  req.clean = clean;

  return { 'error': false };

}

// export function
module.exports = sanitize;
