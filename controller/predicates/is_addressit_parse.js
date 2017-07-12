const _ = require('lodash');

// returns true iff req.clean.parser is addressit
module.exports = (req, res) => _.get(req, 'clean.parser') === 'addressit';
