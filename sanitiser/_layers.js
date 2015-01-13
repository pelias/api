
var isObject = require('is-object'),
    indeces = require('../query/indeces');

// validate inputs, convert types and apply defaults
function sanitize( req ){
  
  var clean = req.clean || {};
  var params= req.query;

  // ensure the input params are a valid object
  if( !isObject( params ) ){
    params = {};
  }

  // default case (no layers specified in GET params)
  if('string' !== typeof params.layers || !params.layers.length){
    // @note: 'address' alias disabled by default feature testing completed
    params.layers = 'poi,admin'; // default layers
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
        'message': 'invalid param \'layer\': must be one or more of ' + alias_indeces.join(',')
      };
    }
  }

  // expand aliases
  var expand_aliases = function(alias, layers, layer_indeces) {
    var alias_index  = layers.indexOf(alias);
    if (alias_index !== -1 ) {
      layers.splice(alias_index, 1);
      layers = layers.concat(layer_indeces);
    }
    return layers;
  };

  layers = expand_aliases('poi',   layers, ['geoname','osmnode','osmway']);
  layers = expand_aliases('admin', layers, ['admin0','admin1','admin2','neighborhood']);
  layers = expand_aliases('address', layers, ['openaddresses']);

  // de-dupe
  layers = layers.filter(function(item, pos) {
    return layers.indexOf(item) === pos;
  });

  // pass validated params to next middleware
  clean.layers = layers;
  req.clean = clean;
  
  return { 'error': false };

}

// export function
module.exports = sanitize;
