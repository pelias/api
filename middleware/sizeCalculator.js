var _ = require('lodash');

var SIZE_PADDING = 2;

var MIN_QUERY_SIZE = 20;

/**
 * Utility for calculating query result size
 * incorporating padding for dedupe process
 */
function setup(min_size) {
  if (min_size === undefined) {
    min_size = MIN_QUERY_SIZE;
  }

  return function setQuerySize(req, res, next) {
    if (_.isUndefined(req.clean) || _.isUndefined(req.clean.size)) {
      return next();
    }

    req.clean.querySize = calculateSize(req.clean.size, min_size);
    next();
  };
}

/**
 * Add padding or set to 1
 *
 * @param {number} cleanSize
 * @returns {number}
 */
function calculateSize(cleanSize, min_size) {
  return Math.max(min_size, cleanSize * SIZE_PADDING);
}

module.exports = setup;
