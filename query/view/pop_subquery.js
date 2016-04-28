
var peliasQuery = require('pelias-query'),
    check = require('check-types');

/**
  Population / Popularity subquery
**/

module.exports = function( vs ){

  var view = peliasQuery.view.ngrams( vs );

  view.match['name.default'].analyzer = vs.var('phrase:analyzer');
  delete view.match['name.default'].boost;

  // only use complete tokens against the phase index (where possible).
  var completeTokens = vs.var('input:name:tokens_complete').get(),
      incompleteTokens = vs.var('input:name:tokens_incomplete').get();

  // if the tokenizer has run (autocomplete only) then we will combine the
  // 'complete' tokens with the 'incomplete' tokens, the resuting array differs
  // slightly from the 'input:name:tokens' array as some tokens might have been
  // removed in the process; such as single grams which are not present in then
  // ngrams index.
  if( check.array( completeTokens ) && check.array( incompleteTokens ) ){
    var combined = completeTokens.concat( incompleteTokens );
    if( combined.length ){
      view.match['name.default'].query = combined.join(' ');
    }
  }

  return view;
};
