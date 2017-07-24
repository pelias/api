const _ = require('lodash');

// return true if any setup parameter is a key of request.clean.parsed_text
// "arguments" is only available in long-form function declarations, cannot be shortened to fat arrow syntax
// potential improvement:  inject set operator to allow for any/all functionality
module.exports = function() {
  // save off requested properties since arguments can't be referenced later
  const properties = _.values(arguments);

  // return true if any of the supplied properties are in clean.parsed_text
  return (request, response) => !_.isEmpty(
    _.intersection(
      properties,
      _.keys(_.get(request, ['clean', 'parsed_text'], {}))
    )
  );

};
