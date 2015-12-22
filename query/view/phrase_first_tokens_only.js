
var peliasQuery = require('pelias-query');

/**
  Phrase view which trims the 'input:name' and uses ALL BUT the last token.

  eg. if the input was "100 foo str", then 'input:name' would only be '100 foo'
  note: it is assumed that the rest of the input is matched using another view.

  there is an additional flag 'input:name:isComplete' used to disable this view
  selectively, see that section for more info.

  code notes: this view makes a copy of the $vs object in order to change their
  values without mutating the original values, which may be expected in their
  unaltered form by other views.
**/

module.exports = function( vs ){

  // Don't mutate the name variable when 'input:name:isComplete' is true.
  // This is the case when the user has typed a comma, so we can assume
  // that the 'name' part of the query is now complete.
  if( vs.var('input:name:isComplete').get() ){
    // return the view rendered using the original vars
    return peliasQuery.view.phrase( vs );
  }

  // make a copy Vars so we don't mutate the original
  var vsCopy = new peliasQuery.Vars( vs.export() );

  // get the input 'name' variable and split in to tokens
  var name = vs.var('input:name').get(),
      tokens = name.split(' ');

  // single token only, abort (we don't want the *last* token)
  // return null here will completely disable the view.
  if( tokens.length < 2 ){ return null; }

  // set the 'name' variable in the copy to all but the last token
  vsCopy.var('input:name').set( name.substr( 0, name.lastIndexOf(' ') ) );

  // return the view rendered using the copy
  return peliasQuery.view.phrase( vsCopy );
};
