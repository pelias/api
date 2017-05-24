const _ = require('lodash');

function setup(comparator) {
  function middleware(req, res, next) {
    // do nothing if there's nothing to do
    if (_.isEmpty(_.get(res, 'data', []))) {
      return next();
    }

    // sort does so in place
    res.data.sort(comparator(_.get(req, 'clean', {})));

    next();
  }

  return middleware;

}

module.exports = setup;
