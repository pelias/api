
var parser     = require('addressit');
var extend     = require('extend');
var type_mapping = require('../helper/type_mapping');
var delim      = ',';
var check      = require('check-types');
var logger     = require('pelias-logger').get('api');

module.exports = {};

/*
 * For performance, and to prefer POI and admin records, express a preference
 * to only search coarse layers on very short text inputs.
 */
module.exports.get_layers = function get_layers(query) {
  if (query.length <= 3 ) {
    // no address parsing required
    return type_mapping.layer_mapping.coarse;
  }
};

module.exports.get_parsed_address = function get_parsed_address(query) {

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

  var parsed_text = {};

  address_parts.forEach(function(part){
    if (parsedAddress[part]) {
      parsed_text[part] = parsedAddress[part];
    }
  });

  // if all we found was regions, ignore it as it is not enough information to make smarter decisions
  if (Object.keys(parsed_text).length === 1 && !check.undefined(parsed_text.regions))
  {
    logger.info('Ignoring address parser output, regions only');
    return null;
  }

  return parsed_text;
};
