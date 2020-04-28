const _ = require('lodash');
const Debug = require('../../helper/debug');
const debugLog = new Debug('controller:predicates:is_request_sources_only_whosonfirst');
const stackTraceLine = require('../../helper/stackTraceLine');

// returns true IFF 'whosonfirst' is the only requested source
module.exports = (req, res) => {
  const is_request_sources_only_whosonfirst = _.isEqual(
    _.get(req, 'clean.sources', []),
    ['whosonfirst']
  );
  debugLog.push(req, () => ({
    reply: is_request_sources_only_whosonfirst,
    stack_trace: stackTraceLine()
  }));
  return is_request_sources_only_whosonfirst;
};
