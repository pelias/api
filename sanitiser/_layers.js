
var isObject = require('is-object'),
    indeces = require('../query/indeces'),
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
  if('string' !== typeof params.layers || !params.layers.length){
    params.layers = 'poi,admin,address'; // default layers
    clean.default_layers_set = true;
  }

  // decide which layers can be queried
  var alias_layers  = ['poi', 'admin', 'address'];
  var alias_indeces = indeces.concat(alias_layers);

  // parse GET params
  var layers = params.layers.split(',').map( function( layer ){
    return layer.toLowerCase(); // lowercase inputs
  });

  // validate layer names
  for( var x=0; x<layers.length; x++ ){
    if( -1 === alias_indeces.indexOf( layers[x] ) ){
      return {
        'error': true,
        'message': 'invalid param \'layers\': must be one or more of ' + alias_indeces.join(',')
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
