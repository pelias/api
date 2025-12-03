const _ = require('lodash');
const Debug = require('../../helper/debug');
const debugLog = new Debug('controller:predicates:has_response_data');

module.exports = (request, response) => {
  const has_response_data = _.get(response, 'data', []).length > 0;
  debugLog.push(request, () => ({
    reply: has_response_data
  }));
  return has_response_data;
};
