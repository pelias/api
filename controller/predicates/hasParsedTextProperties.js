const _ = require('lodash');

// "arguments" is only available in long-form function declarations, cannot be shortened to fat arrow syntax
// potential improvement:  inject set operator to allow for any/all functionality
module.exports = {
  all: function() {
    // save off property names for future reference
    const properties = _.values(arguments);

    // return true if ALL of the supplied properties are in clean.parsed_text
    return request => _.isEmpty(
      _.difference(
        _.values(properties),
        _.keys(_.get(request, ['clean', 'parsed_text'], {}))
      )
    );

  },
  any: function() {
    // save off property names for future reference
    const properties = _.values(arguments);

    // return true if ANY of the supplied properties are in clean.parsed_text
    return request => !_.isEmpty(
      _.intersection(
        _.values(properties),
        _.keys(_.get(request, ['clean', 'parsed_text'], {}))
      )
    );

  }

};
