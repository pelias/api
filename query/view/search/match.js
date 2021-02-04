const optional_params = [
    'boost',
    'operator',
    'analyzer',
    'cutoff_frequency',
    'fuzziness',
    'max_expansions',
    'prefix_length',
    'fuzzy_transpositions',
    'minimum_should_match',
    'zero_terms_query'
];

module.exports = function( property, value, params) {
    if( !property || !value) {
        return null;
    }

    const query = {
        match: {
            [property]: {
                query: value
            }
        }
    };

    optional_params.forEach(function(param) {
        if (params && params[param] && params[param].toString() !== '') {
            query.match[property][param] = params[param];
        }
    });

    return query;
};
