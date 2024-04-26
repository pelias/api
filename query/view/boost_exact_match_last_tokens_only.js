const peliasQuery = require('pelias-query');
const ngrams_last_token_only = require('./ngrams_last_token_only');

/**
 This view is used to boost "exact" matches on last tokens when doing fuzzy queries.
 **/
module.exports = function (vs) {
    const fuzziness = vs.var('fuzzy:fuzziness').get();
    if (!fuzziness) {
        return null;
    }

    var vsCopy = new peliasQuery.Vars( vs.export() );
    vsCopy.var('fuzzy:fuzziness', 0);

    // return the simple view for address queries
    if( vsCopy.isset('input:street') ){ return ngrams_last_token_only(vsCopy); }

    // get a copy of the *tokens_incomplete* tokens produced from the input:name
    var tokens = vsCopy.var('input:name:tokens_incomplete').get();

    // no valid tokens to use, fail now, don't render this view.
    if (!tokens || tokens.length < 1) { return null; }

    // return the simple view for queries with no complete tokens
    var complete_tokens = vsCopy.var('input:name:tokens_complete').get();
    if (!complete_tokens || complete_tokens.length < 1) { return ngrams_last_token_only(vsCopy); }

    // return the simple view when every complete token is numeric
    var all_complete_tokens_numeric = complete_tokens.every(token => !token.replace(/[0-9]/g, '').length);
    if (all_complete_tokens_numeric) { return ngrams_last_token_only(vsCopy); }

    return null;
};
