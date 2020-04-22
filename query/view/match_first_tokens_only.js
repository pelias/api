const peliasQuery = require('pelias-query');

/**
  Phrase view which trims the 'input:name' and uses ALL BUT the last token.

  eg. if the input was "100 foo str", then 'input:name' would only be '100 foo'
  note: it is assumed that the rest of the input is matched using another view.
**/

module.exports = function( vs ){
  const view_name = 'match_first_tokens_only';

  // get a copy of the *complete* tokens produced from the input:name
  const tokens = vs.var('input:name:tokens_complete').get();

  // no valid tokens to use, fail now, don't render this view.
  if( !tokens || tokens.length < 1 ){ return null; }

  // set the 'input' variable to all but the last token
  vs.var(`match:${view_name}:input`).set( tokens.join(' ') );
  vs.var(`match:${view_name}:field`).set(vs.var('phrase:field').get());

  vs.var(`match:${view_name}:analyzer`).set(vs.var('phrase:analyzer').get());
  vs.var(`match:${view_name}:boost`).set(vs.var('phrase:boost').get());
  vs.var(`match:${view_name}:minimum_should_match`).set(vs.var('ngram:minimum_should_match').get());

  return peliasQuery.view.leaf.match(view_name)( vs );
};
