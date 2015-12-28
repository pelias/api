
var peliasQuery = require('pelias-query'),
    ngrams_strict = require('./ngrams_strict');

/**
  Ngrams view which trims the 'input:name' and only uses the LAST TOKEN.

  eg. if the input was "100 foo str", then 'input:name' would only be 'str'
  note: it is assumed that the rest of the input is matched using another view.

  there is an additional flag 'input:name:isComplete' used to disable this view
  selectively, see that section for more info.

  code notes: this view makes a copy of the $vs object in order to change their
  values without mutating the original values, which may be expected in their
  unaltered form by other views.
**/

module.exports = function( vs ){

  // Totally disable this view when bool value 'input:name:isComplete' is true.
  // This is the case when the user has typed a comma, so we can assume
  // that the 'name' part of the query is now complete.
  if( vs.var('input:name:isComplete').get() ){ return null; }

  // make a copy Vars so we don't mutate the original
  var vsCopy = new peliasQuery.Vars( vs.export() );

  // get the input 'name' variable
  var name = vs.var('input:name').get();

  // set the 'name' variable in the copy to only the last token
  vsCopy.var('input:name').set( name.substr( name.lastIndexOf(' ')+1 ) );

  // return the view rendered using the copy
  return ngrams_strict( vsCopy );
};
