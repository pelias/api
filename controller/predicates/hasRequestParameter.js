const _ = require('lodash');
const Debug = require('../../helper/debug');
const debugLog = new Debug('controller:predicates:has_request_parameter');
const stackTraceLine = require('../../helper/stackTraceLine');

// returns true IFF req.clean has a key with the supplied name AND a non-empty value
module.exports = (parameter) => (req, res) => {
  const value = _.get(req, ['clean', parameter]);
  const has_request_parameter = _.isNumber(value) || !_.isEmpty(value);

  debugLog.push(req, () => ({
    reply: {[parameter]: has_request_parameter},
    stack_trace: stackTraceLine()
  }));

  return has_request_parameter;
};
