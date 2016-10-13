var check = require('check-types');
var parser = require('addressit');
var extend = require('extend');
var _      = require('lodash');
var logger = require('pelias-logger').get('api');


// original query cannot handle libpostal's scandic letter conversion ä -> ae
// So try restoring the strings. Simple method below works for 99% of cases

function restoreParsed(parsed, text) {
  var restoreMap = { 'ä':'ae', 'ö':'oe', 'å':'aa' };

  _.forEach(restoreMap, function(xx, c) {
    if(text.indexOf(c) !== -1 ) {
      parsed = parsed.replace(new RegExp(xx, 'g'), c);
    }
  });
  // see if restored string is part of original text
  if(text.indexOf(parsed) !== -1) { // yeah, succeeded
    return parsed;
  }
  return null;
}


function assignValidLibpostalParsing(parsedText, fromLibpostal, text) {

  // if 'query' part is set, libpostal has probably failed in parsing
  // NOTE!! This may change when libpostal parsing improves
  // try reqularly using libpostal parsing also when query field is set.
  if(check.undefined(fromLibpostal.query)) {

    if(check.assigned(fromLibpostal.street)) {
      var street = restoreParsed(fromLibpostal.street, text);
      if(street) {
        parsedText.street = street;
      }
    }

    if(check.assigned(fromLibpostal.city)) {
      var city = restoreParsed(fromLibpostal.city, text);

      if(city) {
        parsedText.city = city;
        parsedText.regions = parsedText.regions || ['']; // 1st entry is the name and will be dropped
        if(parsedText.regions.indexOf(city)===-1) {
          parsedText.regions.push(city);
          parsedText.admin_parts = (parsedText.admin_parts?parsedText.admin_parts+' ,'+city:city);
        }
      }
    }

    if(check.assigned(fromLibpostal.neighbourhood)) {
      var nbrh = restoreParsed(fromLibpostal.neighbourhood, text);

      if(nbrh) {
        parsedText.regions = parsedText.regions || [''];
        if(parsedText.regions.indexOf(nbrh)===-1) {
          parsedText.regions.push(nbrh);
          parsedText.admin_parts = (parsedText.admin_parts?parsedText.admin_parts+' ,'+nbrh:nbrh);
        }
      }
    }
  }
  // assume that numbers are always parsed correctly

  if(check.assigned(fromLibpostal.number)) {
    parsedText.number = fromLibpostal.number;
  }

  if(check.assigned(fromLibpostal.postalcode)) {
    parsedText.postalcode = fromLibpostal.postalcode;
  }

  // remove postalcode from city name
  if(check.assigned(parsedText.postalcode) && check.assigned(parsedText.admin_parts) ) {
    parsedText.admin_parts = parsedText.admin_parts.replace(parsedText.postalcode, '');
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

    // use the libpostal parsed address components if available
    if(check.assigned(fromLibpostal)) {
      parsed_text = parsed_text || {};
      assignValidLibpostalParsing(parsed_text, fromLibpostal, clean.text.toLowerCase());
    }

    if (check.assigned(parsed_text)) {
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
      return parser( query.toLowerCase() );
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
