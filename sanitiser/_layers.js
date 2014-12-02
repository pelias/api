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
    
    var alias_layers  = ['poi', 'admin'];
    var alias_indeces = indeces.concat(alias_layers);

    var layers = params.layers.split(',').map( function( layer ){
      return layer.toLowerCase(); // lowercase inputs
    });
    for( var x=0; x<layers.length; x++ ){
      if( -1 === alias_indeces.indexOf( layers[x] ) ){
        return {
          'error': true,
          'message': 'invalid param \'layer\': must be one or more of ' + alias_indeces.join(',') 
        };
      }
    }
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
    
    // de-dup
    layers = layers.filter(function(item, pos) {
      return layers.indexOf(item) === pos;
    });

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
