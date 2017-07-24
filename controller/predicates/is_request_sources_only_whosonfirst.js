const _ = require('lodash');

// returns true IFF clean.sources only contains 'whosonfirst'
module.exports = (req, res) => (
  _.isEqual(
    _.get(req, 'clean.sources', []),
    ['whosonfirst']
  )
);
