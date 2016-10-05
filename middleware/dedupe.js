var logger = require('pelias-logger').get('api');
var _ = require('lodash');
var isDifferent = require('../helper/diffPlaces').isDifferent;

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
      logger.info('[dupe]', { query: req.clean.text, hit: hit.name.default + ' ' + hit.source + ':' + hit._id });
    }

    // stop looping when requested size has been reached in uniqueResults
    return req.clean.size <= uniqueResults.length;
  });

  res.data = uniqueResults;

  next();
}

module.exports = setup;
