
var check = require('check-types');
var parser = require('addressit');
var extend = require('extend');
var _      = require('lodash');
var logger = require('pelias-logger').get('api');

var api = require('pelias-config').generate().api;

// List of values which should not be included in parsed regions array.
// Usually this includes country name(s) in a national setup.
// FOr example, 'Suomi' in regions array would currently drop confidence
// scores because WOF defines only international country names (Finland)
var filteredRegions;
var cleanRegions;
var postalCodeValidator = function(code) { return true; }; // default = accept everything
var streetNumberValidator = function(code) { return true; };

if (api && api.localization) {
  filteredRegions = api.localization.filteredRegions;
  cleanRegions = api.localization.cleanRegions;
  if(api.localization.postalCodeValidator) {
    var regexp = new RegExp(api.localization.postalCodeValidator);
    postalCodeValidator = function(code) {
      return regexp.test(code);
    };
  }
  if(api.localization.streetNumberValidator) {
    var regexp = new RegExp(api.localization.streetNumberValidator);
    streetNumberValidator = function(code) {
      return regexp.test(code);
    };
  }
}


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
        parsedText.regions = parsedText.regions || [];
        if(parsedText.regions.indexOf(city)===-1) {
          parsedText.regions.push(city);
          parsedText.admin_parts = (parsedText.admin_parts?parsedText.admin_parts+', '+city:city);
        }
      }
    }

    if(check.assigned(fromLibpostal.neighbourhood)) {
      var nbrh = restoreParsed(fromLibpostal.neighbourhood, text);

      if(nbrh && parsedText.name !== nbrh) { // don't add same string to both name and admin parts
        parsedText.regions = parsedText.regions || [];
        if(parsedText.regions.indexOf(nbrh)===-1) {
          parsedText.regions.push(nbrh);
          parsedText.admin_parts = (parsedText.admin_parts?parsedText.admin_parts+', '+nbrh:nbrh);
        }
      }
    }
  }
  // validate street number
  if(check.assigned(fromLibpostal.number) && streetNumberValidator(fromLibpostal.number)) {
    parsedText.number = fromLibpostal.number;
  }

  // validate postalcode
  if(check.assigned(fromLibpostal.postalcode) && postalCodeValidator(fromLibpostal.postalcode)) {
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
    delete clean.parsed_text;

    // parse text with query parser
    var parsed_text = parse(clean.text);

    // use the libpostal parsed address components if available
    if(check.assigned(fromLibpostal)) {
      parsed_text = parsed_text || {};
      assignValidLibpostalParsing(parsed_text, fromLibpostal, clean.text.toLowerCase());
    }

    if (check.assigned(parsed_text) && Object.keys(parsed_text).length > 0) {
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

  // addressit puts 1st parsed part (venue or street name) to regions[0].
  // That is never desirable so drop the first item
  if(cleanRegions && parsed_text.regions) {
    if(parsed_text.regions.length>1) {
      parsed_text.regions = parsed_text.regions.slice(1);
      for (var i in parsed_text.regions) {
        parsed_text.regions[i] = parsed_text.regions[i].toLowerCase();
      }
    } else {
      delete parsed_text.regions;
    }
  }

  // remove undesired region values
  if(parsed_text.regions && filteredRegions) {
    parsed_text.regions = parsed_text.regions.filter(function(value) {
      return(filteredRegions.indexOf(value)===-1);
    });
    if(parsed_text.regions.length===0) {
      delete parsed_text.regions;
    }
  }

  return parsed_text;
}
