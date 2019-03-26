var peliasQuery = require('pelias-query');

/**
  Phrase view which trims the 'input:name' and uses ALL BUT the last token.

  eg. if the input was "100 foo str", then 'input:name' would only be '100 foo'
  note: it is assumed that the rest of the input is matched using another view.

  code notes: this view makes a copy of the $vs object in order to change their
  values without mutating the original values, which may be expected in their
  unaltered form by other views.
**/

module.exports = function( view ){
  return function( vs ){

    // view to use for generating phrase query.
    if (!view) { return null; } // view validation failed

    // get a copy of the *complete* tokens produced from the input:name
    var tokens = vs.var('input:name:tokens_complete').get();

    // no valid tokens to use, fail now, don't render this view.
    if( !tokens || tokens.length < 1 ){ return null; }

    // make a copy Vars so we don't mutate the original
    var vsCopy = new peliasQuery.Vars( vs.export() );

    // set the 'name' variable in the copy to all but the last token
    vsCopy.var('input:name').set( tokens.join(' ') );

    // return the view rendered using the copy
    return view(vsCopy);
  };
};
