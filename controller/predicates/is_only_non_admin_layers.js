const _ = require('lodash');

// return true IFF req.clean.layers is empty OR there are non-venue/address/street layers
module.exports = (req, res) => (
  !_.isEmpty(_.get(req, 'clean.layers', [])) &&
  _.isEmpty(_.difference(req.clean.layers, ['venue', 'address', 'street']))
);
