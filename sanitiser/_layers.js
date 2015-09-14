
var check = require('check-types'),
    types = require('../query/types'),
    get_layers = require('../helper/layers');

// decide which layers can be queried
var ALIAS_LAYERS  = ['poi', 'admin', 'address'],
    ALIAS_TYPES = types.concat(ALIAS_LAYERS),
    ALIAS_TYPES_JOINED = ALIAS_TYPES.join(',');

// validate inputs, convert types and apply defaults
function sanitize( unclean, clean ){

  // error & warning messages
  var messages = { errors: [], warnings: [] };

  // init clean.types
  clean.types = clean.types || {};

  // default case (no layers specified in GET params)
  // don't even set the from_layers key in this case
  if( check.unemptyString( unclean.layers ) ){

    // parse GET params
    var layers = unclean.layers.split(',').map( function( layer ){
      return layer.toLowerCase(); // lowercase inputs
    });

    // validate layer names
    for( var x=0; x<layers.length; x++ ){
      if( -1 === ALIAS_TYPES.indexOf( layers[x] ) ){
        messages.errors.push('invalid param \'layers\': must be one or more of ' + ALIAS_TYPES_JOINED);
      }
    }

    // set 'from_layers' param
    if( !messages.errors.length ){
      clean.types.from_layers = get_layers(layers);
    }
  }

  return messages;
}

// export function
module.exports = sanitize;
