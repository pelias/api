const peliasQuery = require('pelias-query');
const ngrams_strict = require('./ngrams_strict');

module.exports = function (vs) {
    const fuzziness = vs.var('fuzzy:fuzziness').get();
    return peliasQuery.view.focus( fuzziness === 0 ? peliasQuery.view.leaf.match_all : ngrams_strict)(vs);
};
