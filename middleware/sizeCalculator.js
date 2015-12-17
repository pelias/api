var _ = require('lodash');

var SIZE_PADDING = 2;

/**
 * Utility for calculating query result size
 * incorporating padding for dedupe process
 */
function setup() {
 return function setQuerySize(req, res, next) {
   if (_.isUndefined(req.clean) || _.isUndefined(req.clean.size)) {
     return next();
   }

   req.clean.querySize = calculateSize(req.clean.size);
   next();
 };
}

/**
 * Add padding or set to 1
 *
 * @param {number} cleanSize
 * @returns {number}
 */
function calculateSize(cleanSize) {
  switch (cleanSize || 1) {
    case 1:
      return 1;
    default:
      return cleanSize * SIZE_PADDING;
  }
}

module.exports = setup;