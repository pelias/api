const _ = require('lodash');

module.exports = (uri) => {
  // this predicate relies upon the fact that the schema has already validated
  //  that api.pipService is a URI-formatted string
  return (request, response) => {
    return uri !== undefined;
  };
};
