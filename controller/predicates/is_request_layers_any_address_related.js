const _ = require('lodash');
const Debug = require('../../helper/debug');
const debugLog = new Debug('controller:predicates:is_request_layers_any_address_related');
const stackTraceLine = require('../../helper/stackTraceLine');

// return true if any layers allowed by the query are related to an address query
// this includes address and street but NOT venue, postalcode, admin, and custom layers
module.exports = (req, res) => {
  const address_related_layers = ['address', 'street'];

  const request_layers = _.get(req, 'clean.layers', []);
  let result;

  // handle case where no layers are specified
  if (request_layers.length === 0) {
    result = true;
  } else {
    const request_address_related_layers = _.intersection(request_layers, address_related_layers);
    result = request_address_related_layers.length > 0;
  }

  debugLog.push(req, () => ({
    reply: result,
    stack_trace: stackTraceLine()
  }));

  return result;
};
