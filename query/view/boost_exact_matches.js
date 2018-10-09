var peliasQuery = require('pelias-query'),
    searchDefaults = require('../search_defaults');

/**
  This view (unfortunately) requires autocomplete to use the phrase.* index.

  ideally we wouldn't need to use this, but at time of writing we are unable
  to distinguish between 'complete tokens' and 'grams' in the name.* index.

  this view was introduced in order to score exact matches higher than partial
  matches, without it we find results such as "Clayton Avenue" appearing first
  in the results list for the query "Clay Av".

  the view uses some of the values from the 'search_defaults.js' file to add an
  additional 'SHOULD' condition which scores exact matches slighly higher
  than partial matches.

  the 'includePartialTokens' variable was introduced in order to allow the view
  to be reused as an additional boost for tokens which are in fact complete,
  despite us not knowing for sure whether they are complete or not.

  an example is 'Stop 2', without partial tokens the boost will only apply to
  documents matching 'stop', with an additional view we can further boost
  documents matching 'stop 2'.

  note: it is most likely insufficent to include a version of this view in your
  query which has includePartialTokens=true without also having a copy with
  includePartialTokens=false. One view will boost the tokens that are known to
  be complete and the other will additionally boost tokens which may or may not be
  complete, as per the example above.

  note: a clause has been included in the code which disables the view for
  includePartialTokens=true if it would generate the exact same view as for
  includePartialTokens=false.
**/

module.exports = function( includePartialTokens ){
  return function( vs ){

    // make a copy of the variables so we don't interfere with the values
    // passed to other views.
    var vsCopy = new peliasQuery.Vars( vs.export() );

    // copy phrase:* values from search defaults
    vsCopy.var('phrase:analyzer').set(searchDefaults['phrase:analyzer']);
    vsCopy.var('phrase:field').set(searchDefaults['phrase:field']);

    // get a copy of only the *complete* tokens produced from the input:name
    var tokens = vs.var('input:name:tokens_complete').get();

    if( includePartialTokens ){
      // get a copy of *all* tokens produced from the input:name (including partial tokens)
      var allTokens = vs.var('input:name:tokens').get();

      // a duplicate view would be generated, fail now, don't render this view.
      // see file comments for more info
      if( allTokens.join(' ') === tokens.join(' ') ){ return null; }

      // use *all* the tokens for this view instead of only the complete tokens.
      tokens = allTokens;
    }

    // no valid tokens to use, fail now, don't render this view.
    if( !tokens || tokens.length < 1 ){ return null; }

    // set 'input:name' to be only the fully completed characters
    vsCopy.var('input:name').set( tokens.join(' ') );

    return peliasQuery.view.phrase( vsCopy );
  };
};
