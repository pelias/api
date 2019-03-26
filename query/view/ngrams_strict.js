var peliasQuery = require('pelias-query');

// @todo: is this view still being used?

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

  var view = peliasQuery.view.ngrams( vs );

  view.match['name.default'].type = 'phrase';
  view.match['name.default'].operator = 'and';
  view.match['name.default'].slop = vs.var('phrase:slop');

  return view;
};
