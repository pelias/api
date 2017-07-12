const _ = require('lodash');

module.exports = (request, response) => {
  if (!request.clean.hasOwnProperty('parsed_text')) {
    return false;
  }

  // return true only if all non-admin properties of parsed_text are empty
  return ['number', 'street', 'query', 'category', 'postalcode'].every((prop) => {
    return _.isEmpty(request.clean.parsed_text[prop]);
  });

};
