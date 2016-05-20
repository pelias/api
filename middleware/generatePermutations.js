var _ = require('lodash');

function setup() {
  return function generatePermutations(req, res, next) {
    if (_.isUndefined(req.clean) || _.isEmpty(req.clean.parsed_text)) {
      return next();
    }

    req.clean.permutations = [];

    if (req.clean.parsed_text.hasOwnProperty('number')) {
      req.clean.permutations.push(req.clean.parsed_text);

      if (req.clean.parsed_text.hasOwnProperty('street')) {
        req.clean.permutations.push({
          street: req.clean.parsed_text.street,
          city: req.clean.parsed_text.city,
          state: req.clean.parsed_text.state
        });

      }

      if (req.clean.parsed_text.hasOwnProperty('city')) {
        req.clean.permutations.push({
          city: req.clean.parsed_text.city,
          state: req.clean.parsed_text.state
        });

      }

      if (req.clean.parsed_text.hasOwnProperty('state')) {
        req.clean.permutations.push({
          state: req.clean.parsed_text.state
        });
      }

    }

    // { number: '102',
    //   street: 'south charles st',
    //   city: 'red lion',
    //   state: 'pa' }

    next();
  };

}

module.exports = setup;
