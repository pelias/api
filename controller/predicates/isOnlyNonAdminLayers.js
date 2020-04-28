const _ = require('lodash');
const Debug = require('../../helper/debug');
const debugLog = new Debug('controller:predicates:is_only_non_admin_layers');
const stackTraceLine = require('../../helper/stackTraceLine');

// return true IFF req.clean.layers is empty OR there are non-venue/address/street layers
module.exports = (req, res) => {
  const is_only_non_admin_layers = !_.isEmpty(_.get(req, 'clean.layers', [])) &&
  _.isEmpty(_.difference(req.clean.layers, ['venue', 'address', 'street']));

  debugLog.push(req, () => ({
    reply: is_only_non_admin_layers,
    stack_trace: stackTraceLine()
  }));
  return is_only_non_admin_layers;
};
