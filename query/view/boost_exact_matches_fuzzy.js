const boost_exact_matches = require('./boost_exact_matches');

module.exports = function (vs) {
    const fuzziness = vs.var('fuzzy:fuzziness').get();
    return (fuzziness === 0 ? null : boost_exact_matches(vs));
};
