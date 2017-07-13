const _ = require('lodash');

module.exports = (req, res) => _.isEqual(_.get(req, 'clean.sources', []), ['whosonfirst']);
