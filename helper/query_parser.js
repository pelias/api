
var parser     = require('addressit');
var extend     = require('extend');
var get_layers = require('../helper/layers');
var delim      = ',';

module.exports = function(query) {

  var tokenized = query.split(/[ ,]+/);
  var hasNumber = /\d/.test(query);

  var getAdminPartsBySplittingOnDelim = function(query) {
    // naive approach - for admin matching during query time
    // split 'flatiron, new york, ny' into 'flatiron' and 'new york, ny'
    var delimIndex = query.indexOf(delim);
    var address = {};
    if ( delimIndex !== -1 ) {
      address.name = query.substring(0, delimIndex);
      address.admin_parts = query.substring(delimIndex + 1).trim();
    }

    return address;
  };

  var getTargetLayersWhenAddressParsingIsNotNecessary = function(query) {
    var address = {};
    // set target_layer if input length <= 3 characters
    if (query.length <= 3 ) {
      // no address parsing required
      address.target_layer = get_layers(['admin']);
    } else if (tokenized.length === 1 || (tokenized.length < 3 && !hasNumber)) {
      // no need to hit address layers if there's only one (or two) token(s)
      address.target_layer = get_layers(['admin', 'poi']);
    }

    return address.target_layer ? address : null;
  };

  var getAddressParts = function(query) {
    // address parsing
    var address = parser( query );
    // set target_layer if input suggests no address
    if (address.text === address.regions.join(' ') && !hasNumber) {
      address.target_layer = get_layers(['admin', 'poi']);
    }

    return address;
  };

  var addressWithAdminParts  = getAdminPartsBySplittingOnDelim(query);
  var addressWithTargetLayers= getTargetLayersWhenAddressParsingIsNotNecessary(query);
  var addressWithAddressParts= !addressWithTargetLayers ? getAddressParts(query) : {};

  var parsedAddress  = extend(addressWithAdminParts,
                              addressWithTargetLayers,
                              addressWithAddressParts);

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
