const peliasQuery = require('pelias-query');
const toMultiFields = require('./helper').toMultiFields;

/**
  Ngrams view with the additional properties to enable:
  type:phrase -> tokens MUST appear in the same order in BOTH query and index
  operator:and -> ALL tokens are mandatory, missing any single token will cause
  a query failure.
**/

module.exports = function( vs ){

  // validate required params
  if( !vs.isset('phrase:slop') ){
    return null;
  }

  vs.var('multi_match:ngrams_strict:input', vs.var('input:name').get());
  vs.var('multi_match:ngrams_strict:fields', toMultiFields(vs.var('ngram:field').get(), vs.var('lang').get()));

  vs.var('multi_match:ngrams_strict:analyzer', vs.var('ngram:analyzer').get());
  vs.var('multi_match:ngrams_strict:slop', vs.var('phrase:slop').get());
  vs.var('multi_match:ngrams_strict:boost', vs.var('ngram:boost').get());

  return peliasQuery.view.leaf.multi_match('ngrams_strict')(vs);
};
