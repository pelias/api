var isObject = require('is-object');
// var parser1  = require('parse-address'); // works well with US addresses
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
  // var parsedAddress1 = parser1.parseAddress(params.input);

  // postcodes (should be its own file. Contribute back to addressIt)
  // {
  //   "US":/^\d{5}([\-]?\d{4})?$/,
  //   "UK":/^(GIR|[A-Z]\d[A-Z\d]??|[A-Z]{2}\d[A-Z\d]??)[ ]??(\d[A-Z]{2})$/,
  //   "DE":/\b((?:0[1-46-9]\d{3})|(?:[1-357-9]\d{4})|(?:[4][0-24-9]\d{3})|(?:[6][013-9]\d{3}))\b/,
  //   "CA":/^([ABCEGHJKLMNPRSTVXY]\d[ABCEGHJKLMNPRSTVWXYZ])\ {0,1}(\d[ABCEGHJKLMNPRSTVWXYZ]\d)$/,
  //   "FR":/^(F-)?((2[A|B])|[0-9]{2})[0-9]{3}$/,
  //   "IT":/^(V-|I-)?[0-9]{5}$/,
  //   "AU":/^(0[289][0-9]{2})|([1345689][0-9]{3})|(2[0-8][0-9]{2})|(290[0-9])|(291[0-4])|(7[0-4][0-9]{2})|(7[8-9][0-9]{2})$/,
  //   "NL":/^[1-9][0-9]{3}\s?([a-zA-Z]{2})?$/,
  //   "ES":/^([1-9]{2}|[0-9][1-9]|[1-9][0-9])[0-9]{3}$/,
  //   "DK":/^([D-d][K-k])?( |-)?[1-9]{1}[0-9]{3}$/,
  //   "SE":/^(s-|S-){0,1}[0-9]{3}\s?[0-9]{2}$/,
  //   "BE":/^[1-9]{1}[0-9]{3}$/,
  //   "IN":/^\d{6}$/
  // }

  // using US PostCode for now 
  var parsedAddress2 = parser2(params.input, { rePostalCode: /^\d{5}([\-]?\d{4})?$/ });

  // var parsedAddress  = extend(parsedAddress0, parsedAddress1, parsedAddress2);
  var parsedAddress  = extend(parsedAddress0, parsedAddress2);

  var address_parts  =  [ 'name',
                          'number',
                          'street',
                          'city',
                          'state',
                          'country',
                          'postalcode',
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