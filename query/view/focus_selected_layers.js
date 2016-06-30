
var peliasQuery = require('pelias-query');

/**
  This view is the same as `peliasQuery.view.focus` with one exception:

  if the view is generated successfully, we add a 'filter' clause which
  restricts the targeted '_type' to be in the list specified below.

  documents which are not in the '_type' list below will simply score 0 for
  this section of the query.
**/

module.exports = function( subview ){
  return function( vs ){

    // don't perform this query on single character inputs
    // as its too unperformant to sort a large part of the index.
    if( vs.var('input:name').get().length < 2 ){
      return null;
    }

    if( !subview ){ return null; } // subview validation failed
    var macroView = peliasQuery.view.focus( subview );
    if( !macroView ){ return null; } // macroView validation failed
    var view = macroView( vs );

    if( view && view.hasOwnProperty('function_score') ){
      view.function_score.filter = {
        'or': [
          { 'term': { 'layer': 'venue' } },
          { 'term': { 'layer': 'address' } }
        ]
      };
    }

    return view;
  };
};
