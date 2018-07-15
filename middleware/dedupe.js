const logger = require('pelias-logger').get('api');
const _ = require('lodash');
const isDifferent = require('../helper/diffPlaces').isDifferent;
const field = require('../helper/fieldValue');

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

    if (_.isEmpty(uniqueResults)) {
      uniqueResults.push(hit);
    }
    else {
      // if there are multiple items in results, loop through them to find a dupe
      // save off the index of the dupe if found
      var dupeIndex = uniqueResults.findIndex(function (elem, index, array) {
        return !isDifferent(elem, hit);
      });

      // if a dupe is not found, just add to results and move on
      if (dupeIndex === -1) {
        uniqueResults.push(hit);
      }
      // if dupe was found, we need to check which of the records is preferred
      // since the order in which Elasticsearch returns identical text matches is arbitrary
      // of course, if the new one is preferred we should replace previous with new
      else if (isPreferred(uniqueResults[dupeIndex], hit)) {
        logger.debug('[dupe][replacing]', {
          query: req.clean.text,
          previous: uniqueResults[dupeIndex].source,
          hit: field.getStringValue(hit.name.default) + ' ' + hit.source + ':' + hit._id
        });
        // replace previous dupe item with current hit
        uniqueResults[dupeIndex] = hit;
      }
      // if not preferred over existing, just log and move on
      else {
        logger.debug('[dupe][skipping]', {
          query: req.clean.text,
          previous: uniqueResults[dupeIndex].source,
          hit: field.getStringValue(hit.name.default) + ' ' + hit.source + ':' + hit._id
        });
      }
    }

    // stop looping when requested size has been reached in uniqueResults
    return req.clean.size <= uniqueResults.length;
  });

  res.data = uniqueResults;

  next();
}

function isPreferred(existing, candidateReplacement) {
  // NOTE: we are assuming here that the layer for both records is the same
  const hasZip = _.bind(_.has, null, _.bind.placeholder, 'address_parts.zip');

  // https://github.com/pelias/api/issues/872
  const candidateHasZip = hasZip(candidateReplacement);
  const existingHasZip = hasZip(existing);
  if (candidateHasZip !== existingHasZip) {
    return candidateHasZip;
  }

  //bind the trumps function to the data items to keep the rest of the function clean
  var trumpsFunc = trumps.bind(null, existing, candidateReplacement);

  return trumpsFunc('geonames', 'whosonfirst') || // WOF has bbox and is generally preferred
         trumpsFunc('openstreetmap', 'openaddresses') || // addresses are better in OA
         trumpsFunc('whosonfirst', 'openstreetmap'); // venues are better in OSM, at this time
}

function trumps(existing, candidateReplacement, loserSource, winnerSource) {
  return existing.source === loserSource && candidateReplacement.source === winnerSource;
}

module.exports = setup;
