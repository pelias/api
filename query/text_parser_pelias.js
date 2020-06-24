const _ = require('lodash');
const logger = require('pelias-logger').get('api');
const placeTypes = require('../helper/placeTypes');

/*
This list should only contain admin fields we are comfortable matching in the case
when we can't identify parts of an address. This shouldn't contain fields like country_a
or postalcode because we should only try to match those when we're sure that's what they are.
 */
const adminFields = placeTypes.concat([
  'region_a'
]);

// all the address parsing logic
function addParsedVariablesToQueryVariables(clean, vs) {
  // ==== add parsed matches [address components] ====

  // name
  if (!_.isEmpty(clean.parsed_text.subject)) {
    vs.var('input:name', clean.parsed_text.subject);
    vs.var('match_phrase:main:input', clean.parsed_text.subject);
  }

  // housenumber
  if (!_.isEmpty(clean.parsed_text.housenumber)) {
    vs.var('input:housenumber', clean.parsed_text.housenumber);
  }

  // street name
  if (!_.isEmpty(clean.parsed_text.street) && _.isEmpty(clean.parsed_text.cross_street)) {
    // do not query the `street` field if this is an intersection parse
    // otherwise the order of the intersection in the data will determine what results come first
    vs.var('input:street', clean.parsed_text.street);
  }

  // cross street name
  if (!_.isEmpty(clean.parsed_text.cross_street)) {
    vs.var('input:cross_street', clean.parsed_text.cross_street);
  }

  // postcode
  if (!_.isEmpty(clean.parsed_text.postcode) && _.isEmpty(clean.parsed_text.cross_street)) {
    vs.var('input:postcode', clean.parsed_text.postcode);
  }

  // ==== add admin components [postfix] ====
  if (!_.isEmpty(clean.parsed_text.admin)) {
    // assign postfix to any admin fields which currently don't have a value assigned.
    
    // cycle through fields and set fields which are still currently unset
    adminFields.forEach(key => {
      if (!vs.isset('input:' + key)) {
        vs.var('input:' + key, clean.parsed_text.admin);
        vs.var('input:' + key + '_a', clean.parsed_text.admin);
      }
    });
  }
}

module.exports = addParsedVariablesToQueryVariables;
