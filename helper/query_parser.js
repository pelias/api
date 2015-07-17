
var parser     = require('addressit');
var extend     = require('extend');
var get_layers = require('../helper/layers');
var delim      = ',';

module.exports = function(query) {
  var parsedAddress0 = {};
  var parsedAddress1 = {};
  var parsedAddress2 = {};

  // naive approach
  // for admin matching during query time
  // split 'flatiron, new york, ny' into 'flatiron' and 'new york, ny'
  var delimIndex = query.indexOf(delim);
  if ( delimIndex !== -1 ) {
    parsedAddress0.name = query.substring(0, delimIndex);
    parsedAddress0.admin_parts = query.substring(delimIndex + 1).trim();
  }

  var tokenized = query.split(/[ ,]+/);
  var hasNumber = /\d/.test(query);

  // set target_layer if input length <= 3 characters
  if (query.length <= 3 ) {
    // no address parsing required
    parsedAddress2.target_layer = get_layers(['admin']);
  } else if (tokenized.length === 1 || (tokenized.length < 3 && !hasNumber)) {
    // no need to hit address layers if there's only one (or two) token(s)
    parsedAddress2.target_layer = get_layers(['admin', 'poi']);
  } else {
    // address parsing
    parsedAddress1 = parser( query );
    // set target_layer if input suggests no address
    if (parsedAddress1.text === parsedAddress1.regions.join(' ') && !hasNumber) {
      parsedAddress2.target_layer = get_layers(['admin', 'poi']);
    } // else {
      // this might be an overkill - you'd want to search for poi and admin
      // even if an address is being queried. TBD
      // parsedAddress2.target_layer = get_layers(['address']);
      // }
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

  var parsed_input = {};

  address_parts.forEach(function(part){ 
    if (parsedAddress[part]) {
      parsed_input[part] = parsedAddress[part];
    }
  });

  return parsed_input;
};


// parsed_input = {
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