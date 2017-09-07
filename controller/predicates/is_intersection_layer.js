const _ = require('lodash');

module.exports = (request, response) => {
  return _.includes(request.query.text, '&') || _.includes(request.query.text, ' and ');
};
