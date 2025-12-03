const _ = require('lodash');
const Debug = require('../../helper/debug');
const debugLog = new Debug('controller:predicates:has_request_parameter');

// returns true IFF req.clean has a key with the supplied name AND a non-empty value
module.exports = (parameter) => (req, res) => {
  const value = _.get(req, ['clean', parameter]);
  const has_request_parameter = _.isNumber(value) || !_.isEmpty(value);

  debugLog.push(req, () => ({
    reply: {[parameter]: has_request_parameter}
  }));

  return has_request_parameter;
};
