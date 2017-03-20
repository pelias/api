const _ = require('lodash');

module.exports = (request, response) => {
  return _.get(request, 'errors', []).length > 0;
};
