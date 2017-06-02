const _ = require('lodash');

// returns a function that returns true if any result.layer is in any of the
// supplied layers using array intersection

// example usage: determining if the response contains only admin results

module.exports = (layers) => {
  return (request, response) => {
    return !_.isEmpty(
      _.intersection(
        // convert layers to an array if it isn't already one
        _.castArray(layers),
        // pull all the layer properties into an array
        _.map(response.data, _.property('layer'))
    ));
  };

};
