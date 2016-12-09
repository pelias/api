
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
function addParsedVariablesToQueryVariables( parsed_text, vs ){

  // is it a street address?
  var isStreetAddress = parsed_text.hasOwnProperty('number') && parsed_text.hasOwnProperty('street');
  if( isStreetAddress ){
    vs.var( 'input:name', parsed_text.number + ' ' + parsed_text.street );
  }

  // ?
  else if( parsed_text.admin_parts ) {
    vs.var( 'input:name', parsed_text.name );
  }

  // ?
  else {
    logger.warn( 'chaos monkey asks: what happens now?' );
  }

  // ==== add parsed matches [address components] ====

  // house number
  if( parsed_text.hasOwnProperty('number') ){
    vs.var( 'input:housenumber', parsed_text.number );
  }

  // street name
  if( parsed_text.hasOwnProperty('street') ){
    vs.var( 'input:street', parsed_text.street );
  }

  // postal code
  if( parsed_text.hasOwnProperty('postalcode') ){
    vs.var( 'input:postcode', parsed_text.postalcode );
  }

  // ==== add parsed matches [admin components] ====

  // city
  if( parsed_text.hasOwnProperty('city') ){
    vs.var( 'input:county', parsed_text.city );
  }

  // state
  if( parsed_text.hasOwnProperty('state') ){
    vs.var( 'input:region_a', parsed_text.state );
  }

  // country
  if( parsed_text.hasOwnProperty('country') ){
    vs.var( 'input:country_a', parsed_text.country );
  }

  // ==== deal with the 'leftover' components ====
  // @todo: clean up this code

  // a concept called 'leftovers' which is just 'admin_parts' /or 'regions'.
  var leftoversString = '';
  if( parsed_text.hasOwnProperty('admin_parts') ){
    leftoversString = parsed_text.admin_parts;
  }
  else if( parsed_text.hasOwnProperty('regions') ){
    leftoversString = parsed_text.regions.join(' ');
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
