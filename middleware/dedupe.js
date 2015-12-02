var util = require('util');
var logger = require('pelias-logger').get('api:middle:dedupe');
var _ = require('lodash');

function setup() {
  return dedupeResults;
}

function dedupeResults(req, res, next) {
  // do nothing if no result data set
  if (_.isUndefined(req.clean) || _.isUndefined(res) || _.isUndefined(res.data)) {
    return next();
  }

  // loop through data items and only copy unique items to uniqueResults
  var uniqueResults = [];

  _.some(res.data, function (hit) {
    if (uniqueResults.length === 0 || _.every(uniqueResults, isDifferent.bind(null, hit)) ) {
      uniqueResults.push(hit);
    }
    else {
      logger.info('[dupe]', { query: req.clean.text, hit: hit.name.default });
    }

    // stop looping when requested size has been reached in uniqueResults
    return req.clean.size <= uniqueResults.length;
  });

  res.data = uniqueResults;

  next();
}

/**
 * @param {object} item1
 * @param {object} item2
 * @returns {boolean}
 */
function isDifferent(item1, item2) {
  try {
    propMatch(item1, item2, 'admin1_abbr');
    propMatch(item1, item2, 'alpha3');

    if (item1.hasOwnProperty('name') && item2.hasOwnProperty('name')) {
      propMatch(item1.name, item2.name, 'default');
    }
    else if (item1.name !== item2.name) {
      throw 'different';
    }

    if (item1.hasOwnProperty('address') && item2.hasOwnProperty('address')) {
      propMatch(item1.address, item2.address, 'number');
      propMatch(item1.address, item2.address, 'street');
      propMatch(item1.address, item2.address, 'zip');
    }
    else if (item1.address !== item2.address) {
      throw 'different';
    }
  }
  catch (err) {
    return true;
  }

  return false;
}

/**
 * Throw exception if properties are different
 *
 * @param item1
 * @param item2
 * @param prop
 */
function propMatch(item1, item2, prop) {
  if (item1[prop] !== item2[prop]) {
    throw 'different';
  }
}


module.exports = setup;