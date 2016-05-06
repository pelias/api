

var peliasQuery = require('pelias-query'),
    check = require('check-types');

/**
  Population / Popularity subquery
**/

module.exports = function( vs ){

  var view = peliasQuery.view.ngrams( vs );

  var matchLabel = vs.var('ngram:field');

  if ( view.match && matchLabel ) {
    view.match[matchLabel].analyzer = vs.var('phrase:analyzer');
    delete view.match[matchLabel].boost;
  }
  if ( view.multi_match ) {
    view.multi_match.analyzer = vs.var('phrase:analyzer');
    delete view.multi_match.boost;
  }
  return view;
};
