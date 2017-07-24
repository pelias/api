const _ = require('lodash');

// returns true IFF req.clean has a key with the supplied name
module.exports = (parameter) => (req, res) => (_.has(req, ['clean', parameter]));
