var isObject   = require('is-object');
var parser     = require('addressit');
var extend     = require('extend');
var get_layers = require('../helper/layers');

// validate inputs, convert types and apply defaults
function sanitize( req ){
  
  req.clean = req.clean || {};
  var params= req.query;
  var delim = ',';

  // ensure the input params are a valid object
  if( !isObject( params ) ){
    params = {};
  }

  // input text
  if('string' !== typeof params.input || !params.input.length){
    return { 
      'error': true,
      'message': 'invalid param \'input\': text length, must be >0'
    };
  }
  
  req.clean.input = params.input;

  // naive approach
  // for admin matching during query time
  // split 'flatiron, new york, ny' into 'flatiron' and 'new york, ny'
  var delimIndex = params.input.indexOf(delim);
  var parsedAddress0 = {};
  if ( delimIndex !== -1 ) {
    parsedAddress0.name = params.input.substring(0, delimIndex);
    parsedAddress0.admin_parts = params.input.substring(delimIndex + 1).trim();
  }

  // address parsing
  var parsedAddress1 = parser( params.input );

  // input parsing
  var parsedAddress2 = {};
  // set target_layer if input length < 3 characters
  if (params.input.length <= 3) {
    parsedAddress2.target_layer = get_layers(['admin']);
  }
  // set target_layer if input suggests no address
  if (parsedAddress1.text === parsedAddress1.regions.join(' ')) {
    parsedAddress2.target_layer = get_layers(['admin', 'poi']);
  }

  var parsedAddress  = extend(parsedAddress0, parsedAddress1, parsedAddress2);

  var address_parts  =  [ 'name',
                          'number',
                          'street',
                          'city',
                          'state',
                          'country',
                          'postalcode',
                          'regions',
                          'admin_parts',
                          'target_layer'
                        ];
  
  req.clean.parsed_input = {};

  address_parts.forEach(function(part){ 
    if (parsedAddress[part]) {
      req.clean.parsed_input[part] = parsedAddress[part];
    }
  });
  
  // req.clean.parsed_input = {
  //   name   : parsedAddress.name,
  //   number : parsedAddress.number,
  //   street : parsedAddress.street,
  //   city   : parsedAddress.city,
  //   state  : parsedAddress.state,
  //   country: parsedAddress.country,
  //   postalcode : parsedAddress.postalcode,
  //   regions: parsedAddress.regions,
  //   admin_parts: parsedAddress.admin_parts,
  //   target_layer: parsedAddress.target_layer
  // }


  return { 'error': false };

}

// export function
module.exports = sanitize;