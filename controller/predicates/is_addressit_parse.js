const _ = require('lodash');

// returns true IFF req.clean.parser is addressit
module.exports = (req, res) => (_.get(req, 'clean.parser') === 'addressit');
