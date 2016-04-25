
var peliasQuery = require('pelias-query');

/**
  Population / Popularity subquery
**/

module.exports = function( vs ){

  var view = peliasQuery.view.ngrams( vs );

  view.match['name.default'].analyzer = vs.var('phrase:analyzer');
  delete view.match['name.default'].boost;

  return view;
};
