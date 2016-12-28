var logger = require('pelias-logger').get('api');
var _ = require('lodash');

// all the address parsing logic
function addParsedVariablesToQueryVariables( parsed_text, vs ){
  // ==== add parsed matches [address components] ====

  // query - Mexitaly, Sunoco, Lowes
  if ( ! _.isEmpty(parsed_text.query) ) {
    vs.var('input:query', parsed_text.query);
  }

  // categories - restaurants, hotels, bars
  if ( ! _.isEmpty(parsed_text.category) ) {
    vs.var('input:category', parsed_text.category);
  }

  if ( ! _.isEmpty(parsed_text.address) ) {
    vs.var( 'input:address', parsed_text.address );
  }

  // house number
  if( ! _.isEmpty(parsed_text.number) ){
    vs.var( 'input:housenumber', parsed_text.number );
  }

  // street name
  if( ! _.isEmpty(parsed_text.street) ){
    vs.var( 'input:street', parsed_text.street );
  }

  // neighbourhood
  if ( ! _.isEmpty(parsed_text.neighbourhood) ) {
    vs.var( 'input:neighbourhood', parsed_text.neighbourhood);
  }

  // borough
  if ( ! _.isEmpty(parsed_text.borough) ) {
    vs.var( 'input:borough', parsed_text.borough);
  }

  // postal code
  if( ! _.isEmpty(parsed_text.postalcode) ){
    vs.var( 'input:postcode', parsed_text.postalcode );
  }

  // ==== add parsed matches [admin components] ====

  // city
  if( ! _.isEmpty(parsed_text.city) ){
    vs.var( 'input:locality', parsed_text.city );
  }

  // county
  if( ! _.isEmpty(parsed_text.county) ){
    vs.var( 'input:county', parsed_text.county );
  }

  // state
  if( ! _.isEmpty(parsed_text.state) ){
    vs.var( 'input:region', parsed_text.state );
  }

  // country
  if( ! _.isEmpty(parsed_text.country) ){
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
