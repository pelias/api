var check = require('check-types');
var parser = require('addressit');
var _      = require('lodash');
var logger = require('pelias-logger').get('api');

// validate texts, convert types and apply defaults
function _sanitize( raw, clean ){

  // error & warning messages
  var messages = { errors: [], warnings: [] };

  // invalid input 'text'
  if( !check.nonEmptyString( raw.text ) ){
    messages.errors.push('invalid param \'text\': text length, must be >0');
  }

  // valid input 'text'
  else {

    // valid text
    clean.text = raw.text;
    clean.parser = 'addressit';

    // remove anything that may have been parsed before
    delete clean.parsed_text;

    // parse text with query parser
    var parsed_text = parse(clean.text);
    if (check.assigned(parsed_text)) {
      clean.parsed_text = parsed_text;
    }
  }

  return messages;
}

function _expected(){
  return [{ name: 'text' }];
}

// export function
module.exports = () => ({
  sanitize: _sanitize,
  expected: _expected
});

// this is the addressit functionality from https://github.com/pelias/text-analyzer/blob/master/src/addressItParser.js
var DELIM = ',';

function parse(query) {
  var getAdminPartsBySplittingOnDelim = function(queryParts) {
    // naive approach - for admin matching during query time
    // split 'flatiron, new york, ny' into 'flatiron' and 'new york, ny'

    var address = {};

    if (queryParts.length > 1) {
      address.name = queryParts[0].trim();

      // 1. slice away all parts after the first one
      // 2. trim spaces from each part just in case
      // 3. join the parts back together with appropriate delimiter and spacing
      address.admin_parts = queryParts.slice(1)
                                .map(function (part) { return part.trim(); })
                                .join(DELIM + ' ');
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

  var queryParts = query.split(DELIM);

  var addressWithAdminParts  = getAdminPartsBySplittingOnDelim(queryParts);
  var addressWithAddressParts= getAddressParts(queryParts.join(DELIM + ' '));

  // combine the 2 objects
  _.extend(addressWithAdminParts, addressWithAddressParts);

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
    if (addressWithAdminParts[part]) {
      parsed_text[part] = addressWithAdminParts[part];
    }
  });

  // if all we found was regions, ignore it as it is not enough information to make smarter decisions
  if (Object.keys(parsed_text).length === 1 && !_.isUndefined(parsed_text.regions))
  {
    logger.info('Ignoring address parser output, regions only');
    return null;
  }

  return parsed_text;

}
