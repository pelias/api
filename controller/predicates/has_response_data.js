const _ = require('lodash');

module.exports = (request, response) => {
  return _.get(response, 'data', []).length > 0;
};
