const _ = require('lodash');
const Debug = require('../../helper/debug');
const debugLog = new Debug('controller:predicates:is_request_sources_undefined');
const stackTraceLine = require('../../helper/stackTraceLine');

// returns true IFF there are no requested sources
module.exports = (req, res) => {
  const is_request_sources_undefined = _.isEmpty(
    _.get(req, 'clean.sources')
  );
  debugLog.push(req, () => ({
    reply: is_request_sources_undefined,
    stack_trace: stackTraceLine()
  }));
  return is_request_sources_undefined;
};
