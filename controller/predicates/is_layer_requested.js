const _ = require('lodash');
const Debug = require('../../helper/debug');
const debugLog = new Debug('controller:predicates:is_admin_only_analysis');
const stackTraceLine = require('../../helper/stackTraceLine');

// this function returns true IFF request.clean.layers is either undefined or
// contains the supplied layer
module.exports = layer => {
  return (request, response) => {
    // default request.clean.layers to the requested layer for simpler "contains" logic
    const is_layer_requested = _.get(request, ['clean', 'layers'], [layer]).indexOf(layer) >= 0;

    debugLog.push(request, () => ({
      reply: is_layer_requested,
      stack_trace: stackTraceLine()
    }));
    return is_layer_requested;
  };
};
