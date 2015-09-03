
var parser     = require('addressit');
var extend     = require('extend');
var get_layers_helper = require('../helper/layers');
var delim      = ',';

module.exports = {};

module.exports.get_layers = function get_layers(query) {
  var tokenized = query.split(/[ ,]+/);
  var hasNumber = /\d/.test(query);

  if (query.length <= 3 ) {
    // no address parsing required
    return get_layers_helper(['admin']);
  } else if (tokenized.length === 1 || (tokenized.length < 3 && !hasNumber)) {
    // no need to hit address layers if there's only one (or two) token(s)
    return get_layers_helper(['admin', 'poi']);
  }
};

module.exports.get_parsed_address = function get_parsed_address(query) {

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

  var getAddressParts = function(query) {
    // perform full address parsing
    // except on queries so short they obviously can't contain an address
    if (query.length > 3) {
      return parser( query );
    }
  };

  var addressWithAdminParts  = getAdminPartsBySplittingOnDelim(query);
  var addressWithAddressParts= getAddressParts(query);

  var parsedAddress  = extend(addressWithAdminParts,
                              addressWithAddressParts);

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

  var parsed_input = {};

  address_parts.forEach(function(part){
    if (parsedAddress[part]) {
      parsed_input[part] = parsedAddress[part];
    }
  });

  return parsed_input;
};
