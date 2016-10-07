var check = require('check-types');
var parser = require('addressit');
var extend = require('extend');
var _      = require('lodash');
var logger = require('pelias-logger').get('api');


// don't throw away useful parsing information from libpostal
// if street name and number are known, they shoudl be included in the query
function addressFromLibpostal(parsed_text, fromLibpostal, text) {
  var street = fromLibpostal.street;

  if(check.undefined(parsed_text.street) && check.assigned(street) && check.assigned(fromLibpostal.number)) {
    text = text.toLowerCase();
    var restoreMap = { 'ä':'ae', 'ö':'oe', 'å':'aa' };

    _.forEach(restoreMap, function(xx, c) {
      if(text.indexOf(c) !== -1 ) {
        street = street.replace(new RegExp(xx, 'g'), c);
      }
    });
    if(text.indexOf(street) !== -1) { // wow, succeeded
      parsed_text.street = street;
      parsed_text.number = fromLibpostal.number;

      if(check.assigned(parsed_text.name)) {
        if(parsed_text.name.indexOf(street)!==-1) {
          // skip the name if it is the same as the address
          parsed_text.name = undefined;
        }
      }
    }
  }
  if(check.undefined(parsed_text.postalcode) && check.assigned(fromLibpostal.postalcode)) {
    parsed_text.postalcode = fromLibpostal.postalcode;
  }
}


// validate texts, convert types and apply defaults
function sanitize( raw, clean ){

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

    // remove anything that may have been parsed before
    var fromLibpostal = clean.parsed_text;
    clean.parsed_text = null;

    // parse text with query parser
    var parsed_text = parse(clean.text);

    if (check.assigned(parsed_text)) {
      // use the libpostal parsed street address if available, unless
      // there's a reason to believe that libpostal has failed in parsing
      // NOTE!! This may change when libpostal parsing improves
      // try reqularly using libpostal parsing also when query field is set.
      if(check.assigned(fromLibpostal) && check.undefined(fromLibpostal.query)) {
        addressFromLibpostal(parsed_text, fromLibpostal, clean.text);
      }
      clean.parsed_text = parsed_text;
    }
  }

  return messages;
}

// export function
module.exports = sanitize;

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
  if (Object.keys(parsed_text).length === 1 && !_.isUndefined(parsed_text.regions))
  {
    logger.info('Ignoring address parser output, regions only');
    return null;
  }

  return parsed_text;

}
