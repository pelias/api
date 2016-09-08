var logger = require('pelias-logger').get('api');

// all the address parsing logic
function addParsedVariablesToQueryVariables( parsed_text, vs ){
  // ==== add parsed matches [address components] ====

  // query - Mexitaly, Sunoco, Lowes
  if (parsed_text.hasOwnProperty('query')) {
    vs.var('input:query', parsed_text.query);
  }

  // categories - restaurants, hotels, bars
  if (parsed_text.hasOwnProperty('category')) {
    vs.var('input:category', parsed_text.category);
  }

  // house number
  if( parsed_text.hasOwnProperty('number') ){
    vs.var( 'input:housenumber', parsed_text.number );
  }

  // street name
  if( parsed_text.hasOwnProperty('street') ){
    vs.var( 'input:street', parsed_text.street );
  }

  // neighbourhood
  if (parsed_text.hasOwnProperty('neighbourhood')) {
    vs.var( 'input:neighbourhood', parsed_text.neighbourhood);
  }

  // borough
  if (parsed_text.hasOwnProperty('borough')) {
    vs.var( 'input:borough', parsed_text.borough);
  }

  // postal code
  if( parsed_text.hasOwnProperty('postalcode') ){
    vs.var( 'input:postcode', parsed_text.postalcode );
  }

  // ==== add parsed matches [admin components] ====

  // city
  if( parsed_text.hasOwnProperty('city') ){
    vs.var( 'input:locality', parsed_text.city );
  }

  // county
  if( parsed_text.hasOwnProperty('county') ){
    vs.var( 'input:county', parsed_text.county );
  }

  // state
  if( parsed_text.hasOwnProperty('state') ){
    vs.var( 'input:region', parsed_text.state );
  }

  // country
  if( parsed_text.hasOwnProperty('country') ){
    vs.var( 'input:country', parsed_text.country );
  }

  // libpostal sometimes parses addresses with prefix house numbers in places where
  // the house number is normally postfix incorrectly, for instance:
  // ```> 1 Grolmanstraße, Berlin, Germany
  //
  // Result:
  //
  // {
  //   "house": "1",
  //   "road": "grolmanstrasse",
  //   "state": "berlin",
  //   "country": "germany"
  // }```
  //
  // In libpostal parlance, `house` is just a query term, not the house number.
  // This special case moves the query term to the house number field if there's a street,
  // there's no house number, and the query is parseable as an integer, then use the
  // query as the house number and blank out the query.
  if (shouldSetQueryIntoHouseNumber(vs)) {
    vs.var( 'input:housenumber', vs.var('input:query').toString());
    vs.unset( 'input:query' );
  }

}

function shouldSetQueryIntoHouseNumber(vs) {
  return !vs.isset('input:housenumber') &&
          vs.isset('input:street') &&
          /^[0-9]+$/.test(vs.var('input:query').toString());
}

module.exports = addParsedVariablesToQueryVariables;
