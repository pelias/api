const _ = require('lodash');

function setup(comparator, should_execute) {
  function middleware(req, res, next) {
    // bail early if req/res don't pass conditions for execution or there's no data to sort
    if (!should_execute(req, res) || _.isEmpty(res.data)) {
      return next();
    }

    // sort operates on array in place
    res.data.sort(comparator(req.clean));

    next();
  }

  return middleware;

}

module.exports = setup;
