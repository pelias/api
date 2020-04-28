const _ = require('lodash');
const Debug = require('../../helper/debug');
const debugLog = new Debug('controller:predicates:is_request_sources_includes_whosonfirst');
const stackTraceLine = require('../../helper/stackTraceLine');

// returns true IFF 'whosonfirst' is included in the requested sources
module.exports = (req, res) => {
  const is_request_sources_includes_whosonfirst = _.get(req, 'clean.sources', []).includes(
    'whosonfirst'
  );
  debugLog.push(req, () => ({
    reply: is_request_sources_includes_whosonfirst,
    stack_trace: stackTraceLine()
  }));
  return is_request_sources_includes_whosonfirst;
};
