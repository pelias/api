const peliasQuery = require('pelias-query');
const toMultiFieldsWithWildcards = require('./helper').toMultiFieldsWithWildcards;

/**
  Phrase view which trims the 'input:name' and uses ALL BUT the last token.

  eg. if the input was "100 foo str", then 'input:name' would only be '100 foo'
  note: it is assumed that the rest of the input is matched using another view.
**/

module.exports = function( vs ){
  const view_name = 'first_tokens_only';
  // get a copy of the *complete* tokens produced from the input:name
  const tokens = vs.var('input:name:tokens_complete').get();

  // no valid tokens to use, fail now, don't render this view.
  if( !tokens || tokens.length < 1 ){ return null; }

  // set the 'input' variable to all but the last token
  vs.var(`multi_match:${view_name}:input`).set( tokens.join(' ') );
  vs.var(`multi_match:${view_name}:fields`, toMultiFieldsWithWildcards(
    vs.var('phrase:field').get(),
    vs.var('lang').get(),
  ));

  vs.var(`multi_match:${view_name}:analyzer`).set(vs.var('phrase:analyzer').get());
  vs.var(`multi_match:${view_name}:boost`).set(vs.var('phrase:boost').get());
  vs.var(`multi_match:${view_name}:slop`).set(vs.var('phrase:slop').get());

  return peliasQuery.view.leaf.multi_match(view_name)( vs );
};
