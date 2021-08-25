const peliasQuery = require('pelias-query');
const phrase_first_tokens_only = require('../view/phrase_first_tokens_only');

/**
 This view is used to boost "exact" matches on first tokens when doing fuzzy queries.
 **/
module.exports = function (vs) {
    const fuzziness = vs.var('fuzzy:fuzziness').get();
    if (!fuzziness) {
        return null;
    }

    var vsCopy = new peliasQuery.Vars( vs.export() );
    vsCopy.var('fuzzy:fuzziness', 0);

    return phrase_first_tokens_only(vsCopy);
};
