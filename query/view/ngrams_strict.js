const _ = require('lodash');
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

  // if the input is a single incomplete token then add
  // a field targeting country-code abbreviations.
  var incomplete = vs.var('input:name:tokens_incomplete').get();
  var complete = vs.var('input:name:tokens_complete').get();
  if (_.size(incomplete) === 1 && _.size(complete) === 0) {
    vs.var('multi_match:ngrams_strict:fields', vs.var('multi_match:ngrams_strict:fields')
      .get().concat([
        vs.var('admin:country_a:field').get()
      ])
    );
  }

  vs.var('multi_match:ngrams_strict:analyzer', vs.var('ngram:analyzer').get());
  vs.var('multi_match:ngrams_strict:slop', vs.var('phrase:slop').get());
  vs.var('multi_match:ngrams_strict:boost', vs.var('ngram:boost').get());

  return peliasQuery.view.leaf.multi_match('ngrams_strict')(vs);
};
