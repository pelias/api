const peliasQuery = require('pelias-query');
const searchDefaults = require('../search_defaults');
const lang_multi_match = require('./lang_multi_match');

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
**/

module.exports = function( vs ){

  // make a copy of the variables so we don't interfere with the values
  // passed to other views.
  var vsCopy = new peliasQuery.Vars( vs.export() );

  // copy phrase:* values from search defaults
  vsCopy.var('lang_multi_match:analyzer').set(searchDefaults['phrase:analyzer']);
  vsCopy.var('lang_multi_match:field').set(searchDefaults['phrase:field']);

  // get a copy of the *complete* tokens produced from the input:name
  const tokens = vs.var('input:name:tokens_complete').get();

  // no valid tokens to use, fail now, don't render this view.
  if( !tokens || tokens.length < 1 ){ return null; }

  return lang_multi_match( vsCopy );
};
