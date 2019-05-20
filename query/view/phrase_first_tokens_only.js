const peliasQuery = require('pelias-query');
const lang_multi_match = require('./lang_multi_match');

/**
  Phrase view which trims the 'input:name' and uses ALL BUT the last token.

  eg. if the input was "100 foo str", then 'input:name' would only be '100 foo'
  note: it is assumed that the rest of the input is matched using another view.
**/

module.exports = function( vs ){

  // get a copy of the *complete* tokens produced from the input:name
  const tokens = vs.var('input:name:tokens_complete').get();

  // no valid tokens to use, fail now, don't render this view.
  if( !tokens || tokens.length < 1 ){ return null; }

  // make a copy Vars so we don't mutate the original
  var vsCopy = new peliasQuery.Vars( vs.export() );

  // set the 'name' variable in the copy to all but the last token
  vsCopy.var('input:name').set( tokens.join(' ') );
  vsCopy.var('lang_multi_match:analyzer').set(vs.var('phrase:analyzer').get());
  vsCopy.var('lang_multi_match:boost').set(vs.var('phrase:boost').get());

  // return the view rendered using the copy
  return lang_multi_match( vsCopy );
};
