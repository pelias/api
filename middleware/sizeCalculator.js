var _ = require('lodash');
var iterate = require('../helper/iterate');

var SIZE_PADDING = 2;

/**
 * Utility for calculating query result size
 * incorporating padding for dedupe process
 */
function setup() {
 return function setQuerySize(req, res, next) {
   if (_.isUndefined(req.clean)) {
     return next();
   }

   iterate(req.clean, function(clean) {
     if(!_.isUndefined(clean.size)) {
       clean.querySize = calculateSize(clean.size);
     }
   });
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
