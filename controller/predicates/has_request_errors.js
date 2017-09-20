const _ = require('lodash');
const Debug = require('../../helper/debug');
const debugLog = new Debug('controller:predicates:has_request_errors');
const stackTraceLine = require('../../helper/stackTraceLine');

module.exports = (req, res) => {
  const has_request_errors = _.get(req, 'errors', []).length > 0;
  debugLog.push(req, () => ({
    reply: has_request_errors,
    stack_trace: stackTraceLine()
  }));
  return has_request_errors;
};
