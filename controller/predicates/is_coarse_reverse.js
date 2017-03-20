const _ = require('lodash');

const non_coarse_layers = ['address', 'street', 'venue'];

module.exports = (req, res) => {
  // returns true if layers is undefined, empty, or contains 'address', 'street', or 'venue'
  return !_.isEmpty(req.clean.layers) &&
          _.intersection(req.clean.layers, non_coarse_layers).length === 0;
};
