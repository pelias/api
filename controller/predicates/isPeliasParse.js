const _ = require('lodash');

// returns true IFF req.clean.parser is pelias
module.exports = (req) => {
  return _.get(req, 'clean.parser') === 'pelias';
};
