const match_phrase = require('./match_phrase');
const match = require('./match');

module.exports = (vs) => {
    const fuzziness = vs.var('fuzzy:fuzziness').get();

    if (fuzziness === 0) {
        return match_phrase('address_parts.street', vs.var('input:street'), {
            slop: vs.var('address:street:slop'),
            analyzer: vs.var('address:street:analyzer')
        });
    }
    return match('address_parts.street', vs.var('input:street'), {
        analyzer: vs.var('address:street:analyzer'),
        fuzziness: fuzziness,
        max_expansions: vs.var('fuzzy:max_expansions'),
        prefix_length: vs.var('fuzzy:prefix_length'),
        operator: 'and'
    });
};
