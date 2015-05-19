var isObject = require('is-object');
var parser1  = require('parse-address'); // works well with US addresses
var parser2  = require('addressit'); // freeform address parser (backup)
var extend   = require('extend');

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
  var parsedAddress1 = parser1.parseAddress(params.input);
  var parsedAddress2 = parser2(params.input);

  var parsedAddress  = extend(parsedAddress0, parsedAddress1, parsedAddress2);

  var address_parts  =  [ 'name',
                          'number',
                          'street',
                          'city',
                          'state',
                          'country',
                          'zip',
                          'regions',
                          'admin_parts'
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
  //   admin2 : parsedAddress.city,
  //   admin1 : parsedAddress.state,
  //   admin0 : parsedAddress.country,
  //   zip    : parsedAddress.zip,
  //   regions: parsedAddress.regions,
  //   admin_parts: parsedAddress.admin_parts
  // }


  return { 'error': false };

}

// export function
module.exports = sanitize;