const _ = require('lodash');

// predicate that determines if parsed_text contains only the supplied property
module.exports = property => (req, res) =>
    _.isEqual(_.keys(_.get(req, ['clean', 'parsed_text'])), [property]);
