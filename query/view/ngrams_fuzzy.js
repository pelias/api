const peliasQuery = require('pelias-query');
const toMultiFields = require('./helper').toMultiFields;

/**
 Ngrams view with fuzziness
 **/

module.exports = function (vs) {
    vs.var('multi_match:ngrams_fuzzy:input', vs.var('input:name').get());
    vs.var('multi_match:ngrams_fuzzy:fields', toMultiFields(vs.var('ngram:field').get(), vs.var('lang').get()));

    vs.var('multi_match:ngrams_fuzzy:analyzer', vs.var('ngram:analyzer').get());
    vs.var('multi_match:ngrams_fuzzy:boost', vs.var('ngram:boost').get());

    vs.var('multi_match:ngrams_fuzzy:fuzziness', vs.var('fuzzy:fuzziness').get());
    vs.var('multi_match:ngrams_fuzzy:max_expansions', vs.var('fuzzy:max_expansions').get());
    vs.var('multi_match:ngrams_fuzzy:prefix_length', vs.var('fuzzy:prefix_length').get());

    return peliasQuery.view.leaf.multi_match('ngrams_fuzzy')(vs);
};
