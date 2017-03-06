const _ = require('lodash');

module.exports = (req, res) => {
  // returns true if layers is undefined, empty, or contains 'address' or 'venue'
  return !_.isEmpty(req.clean.layers) &&
          _.intersection(req.clean.layers, ['address', 'venue']).length === 0;
};
