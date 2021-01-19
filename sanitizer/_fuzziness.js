const _ = require('lodash');

function _sanitize( raw, clean ){
    const IS_NUMERIC_REGEXP = /^\d+$/;

    // error & warning messages
    var messages = { errors: [], warnings: [] };

    if (_.isUndefined(raw)) {
        return messages;
    }

    if (_.has(raw, 'fuzziness')) {
        if (raw.fuzziness === 'AUTO') {
            clean.fuzziness = raw.fuzziness;
        } else if (IS_NUMERIC_REGEXP.test(raw.fuzziness) && parseInt(raw.fuzziness) > 0 && parseInt(raw.fuzziness) <= 2) {
            clean.fuzziness = parseInt(raw.fuzziness);
        } else {
            messages.errors.push('invalid value for fuzziness; valid values are 1, 2 and AUTO');
        }

        if (_.has(raw, 'max_expansions')) {
            if (IS_NUMERIC_REGEXP.test(raw.max_expansions) &&
                parseInt(raw.max_expansions) >= 0 &&
                parseInt(raw.max_expansions) <= 50) {

                clean.max_expansions = parseInt(raw.max_expansions);
            } else {
                messages.errors.push('invalid value for max_expansions; valid values are between 0 and 50');
            }
        }
    }

    return messages;
}

function _expected() {
    return [
        { name: 'fuzziness' },
        { name: 'max_expansions' }];
}

module.exports = () => ({
    sanitize: _sanitize,
    expected: _expected
});
