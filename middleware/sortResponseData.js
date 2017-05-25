const _ = require('lodash');

const logger = require('pelias-logger').get('api');

function setup(comparator, should_execute) {
  function middleware(req, res, next) {
    // bail early if req/res don't pass conditions for execution or there's no data to sort
    if (!should_execute(req, res) || _.isEmpty(res.data)) {
      return next();
    }

    // capture the pre-sort order
    const presort_order = res.data.map(_.property('_id'));

    // sort operates on array in place
    res.data.sort(comparator(req.clean));

    // capture the post-sort order
    const postsort_order = res.data.map(_.property('_id'));

    // log it for debugging purposes
    logger.debug([
      `req.clean: ${JSON.stringify(req.clean)}`,
      `pre-sort: [${presort_order}]`,
      `post-sort: [${postsort_order}]`
    ].join(', '));

    next();
  }

  return middleware;

}

module.exports = setup;
