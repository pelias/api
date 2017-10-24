const _ = require('lodash');

module.exports = (request, response) => {
  if(request) {
      return _.includes(request.query.text, '&') || _.includes(request.query.text, ' and ');
  }

  return false;
};
