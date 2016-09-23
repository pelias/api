/**
 *
 * Accuracy level should be set for each item in the results.
 * The level can be any of the following:
 *  - point
 *  - interpolated
 *  - centroid
 */

var check = require('check-types');

var accuracyLevelPoint = 'point';
var accuracyLevelInterpolated = 'interpolated';
var accuracyLevelCentroid = 'centroid';


function setup() {
  return computeAccuracy;
}

function computeAccuracy(req, res, next) {
  // do nothing if no result data set
  if (check.undefined(res) || check.undefined(res.data)) {
    return next();
  }

  // loop through data items and determine accuracy levels
  res.data = res.data.map(computeAccuracyLevelForResult);

  next();
}

/**
 * Determine accuracy level based on the type of result being returned.
 *
 * @param {object} hit
 * @returns {object}
 */
function computeAccuracyLevelForResult(hit) {

  // TODO: add a check for interpolated addresses when that feature lands

  switch (hit.layer) {
    case 'venue':
    case 'address':
      hit.accuracy = accuracyLevelPoint;
      break;
    // this means it's a street or admin area
    default:
      hit.accuracy = accuracyLevelCentroid;
      break;
  }

  return hit;
}

module.exports = setup;
