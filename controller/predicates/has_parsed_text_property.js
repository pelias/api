const _ = require('lodash');

// returns a function that returns true if any result.layer is in any of the
// supplied layers using array intersection

// example usage: determining if the response contains only admin results

module.exports = (property) => {
  return (request, response) => {
    return _.has(request, ['clean', 'parsed_text', property]);
  };

};
