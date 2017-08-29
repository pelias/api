const _ = require('lodash');

// returns true IFF 'whosonfirst' is the only requested source
module.exports = (req, res) => (
  _.isEqual(
    _.get(req, 'clean.sources', []),
    ['whosonfirst']
  )
);
