
var peliasQuery = require('pelias-query');

/**
  Ngrams view with the additional properties to enable:
  type:phrase -> tokens MUST appear in the same order in BOTH query and index
  operator:and -> ALL tokens are mandatory, missing any single token will cause
  a query failure.
**/

module.exports = function( vs ){

  var view = peliasQuery.view.ngrams( vs );

  if (!view) {
    return null;
  }

  var target;
  if(vs.isset('ngram:multifield')) {
    target = view.multi_match;
  }
  else {
    target = view.match[vs.var('ngram:field')];
  }
  target.type = 'phrase';
  target.operator = 'and';

  return view;
};
