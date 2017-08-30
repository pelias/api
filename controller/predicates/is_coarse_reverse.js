const _ = require('lodash');
const Debug = require('../../helper/debug');
const debugLog = new Debug('controller:predicates:is_coarse_reverse');
const non_coarse_layers = ['address', 'street', 'venue'];

module.exports = (req, res) => {
  // returns true if layers is undefined, empty, or contains 'address', 'street', or 'venue'
  const is_coarse_reverse = !_.isEmpty(req.clean.layers) &&
          _.isEmpty(_.intersection(req.clean.layers, non_coarse_layers));

  debugLog.push(req, is_coarse_reverse);
  return is_coarse_reverse;
};
