const _ = require('lodash');

module.exports = (parameter) => (req, res) => (_.has(req, ['clean', parameter]));
