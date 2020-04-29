const _ = require('lodash');
const Debug = require('../../helper/debug');
const debugLog = new Debug('controller:predicates:has_response_data');
const stackTraceLine = require('../../helper/stackTraceLine');

module.exports = (request, response) => {
  const has_response_data = _.get(response, 'data', []).length > 0;
  debugLog.push(request, () => ({
    reply: has_response_data,
    stack_trace: stackTraceLine()
  }));
  return has_response_data;
};
