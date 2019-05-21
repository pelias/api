const peliasQuery = require('pelias-query');
const lang_multi_match = require('./lang_multi_match');

/**
  Ngrams view with the additional properties to enable:
  type:phrase -> tokens MUST appear in the same order in BOTH query and index
  operator:and -> ALL tokens are mandatory, missing any single token will cause
  a query failure.
**/

module.exports = function( vs ){

  // make a copy Vars so we don't mutate the original
  const vsCopy = new peliasQuery.Vars( vs.export() );

  vsCopy.var('lang_multi_match:analyzer').set(vs.var('ngram:analyzer').get());
  vsCopy.var('lang_multi_match:boost').set(vs.var('ngram:boost').get());

  return lang_multi_match( vsCopy );
};
