var peliasQuery = require('pelias-query');

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

  vs.var('match_phrase:ngrams_strict:input', vs.var('input:name').get());
  vs.var('match_phrase:ngrams_strict:field', vs.var('ngram:field').get());

  vs.var('match_phrase:ngrams_strict:analyzer', vs.var('ngram:analyzer').get());
  vs.var('match_phrase:ngrams_strict:slop', vs.var('phrase:slop').get());
  vs.var('match_phrase:ngrams_strict:boost', vs.var('ngram:boost').get());

  return peliasQuery.view.leaf.match_phrase('ngrams_strict')(vs);
};
