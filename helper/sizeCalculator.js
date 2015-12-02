/**
 * Utility for calculating query result size
 * incorporating padding for dedupe process
 */

var SIZE_PADDING = 2;

/**
 * Add padding or set to 1
 *
 * @param {number} cleanSize
 * @returns {number}
 */
module.exports = function calculateSize(cleanSize) {
  switch (cleanSize || 1) {
    case 1:
      return 1;
    default:
      return cleanSize * SIZE_PADDING;
  }
};