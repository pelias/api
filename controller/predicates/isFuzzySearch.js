const Debug = require('../../helper/debug');
const debugLog = new Debug('controller:predicates:is_fuzzy_search');
const stackTraceLine = require('../../helper/stackTraceLine');

module.exports = (request, response) => {
    if (!request.clean.hasOwnProperty('fuzziness')) {
        debugLog.push(request, false + ' (no fuzziness)');
        return false;
    }

    const is_fuzzy_search = request.clean.fuzziness !== 0;

    debugLog.push(request, () => ({
        reply: is_fuzzy_search,
        stack_trace: stackTraceLine()
    }));
    return is_fuzzy_search;
};
