var logger = require('pelias-logger').get('api');
var placeTypes = require('../helper/placeTypes');

/*
This list should only contain admin fields we are comfortable matching in the case
when we can't identify parts of an address. This shouldn't contain fields like country_a
or postalcode because we should only try to match those when we're sure that's what they are.
 */
var adminFields = placeTypes.concat([
  'region_a'
]);

/**
  @todo: refactor me
**/

// all the address parsing logic
function addParsedVariablesToQueryVariables( clean, vs ){

  // is it a street address?
  var isStreetAddress = clean.parsed_text.hasOwnProperty('number') && clean.parsed_text.hasOwnProperty('street');
  if( isStreetAddress ){
    vs.var( 'input:name', clean.parsed_text.number + ' ' + clean.parsed_text.street );
  }

  // ?
  else if( clean.parsed_text.admin_parts ) {
    vs.var( 'input:name', clean.parsed_text.name );
  }

  // ?
  else {
    logger.warn( 'chaos monkey asks: what happens now?', {
      params: clean
    });
  }

  // ==== add parsed matches [address components] ====

  // house number
  if( clean.parsed_text.hasOwnProperty('number') ){
    vs.var( 'input:housenumber', clean.parsed_text.number );
  }

  // street name
  if( clean.parsed_text.hasOwnProperty('street') ){
    vs.var( 'input:street', clean.parsed_text.street );
  }

  // postal code
  if( clean.parsed_text.hasOwnProperty('postalcode') ){
    vs.var( 'input:postcode', clean.parsed_text.postalcode );
  }

  // ==== add parsed matches [admin components] ====

  // city
  if( clean.parsed_text.hasOwnProperty('city') ){
    vs.var( 'input:county', clean.parsed_text.city );
  }

  // state
  if( clean.parsed_text.hasOwnProperty('state') ){
    vs.var( 'input:region_a', clean.parsed_text.state );
  }

  // country
  if( clean.parsed_text.hasOwnProperty('country') ){
    vs.var( 'input:country_a', clean.parsed_text.country );
  }

  // ==== deal with the 'leftover' components ====
  // @todo: clean up this code

  // a concept called 'leftovers' which is just 'admin_parts' /or 'regions'.
  var leftoversString = '';
  if( clean.parsed_text.hasOwnProperty('admin_parts') ){
    leftoversString = clean.parsed_text.admin_parts;
  }
  else if( clean.parsed_text.hasOwnProperty('regions') ){
    leftoversString = clean.parsed_text.regions.join(' ');
  }

  // if we have 'leftovers' then assign them to any fields which
  // currently don't have a value assigned.
  if( leftoversString.length ){

    // cycle through fields and set fields which
    // are still currently unset
    adminFields.forEach( function( key ){
      if( !vs.isset( 'input:' + key ) ){
        vs.var( 'input:' + key, leftoversString );
      }
    });
  }
}

module.exports = addParsedVariablesToQueryVariables;
