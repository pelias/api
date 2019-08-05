const logger = require('pelias-logger').get('api');
const _ = require('lodash');
const isDifferent = require('../helper/diffPlaces').isDifferent;
const layerPreferences = require('../helper/diffPlaces').layerPreferences;
const canonical_sources = require('../helper/type_mapping').canonical_sources;
const field = require('../helper/fieldValue');

function dedupeResults(req, res, next) {

  // do nothing if request data is invalid
  if( _.isUndefined(res) || !_.isPlainObject(req.clean) ){ return next(); }

  // do nothing if no result data is invalid
  if( _.isUndefined(res) || !_.isArray(res.data) || _.isEmpty(res.data) ){ return next(); }

  // loop through data items and only copy unique items to unique
  // note: the first results must always be unique!
  let unique = [ res.data[0] ];

  // convenience function to search unique array for an existing element which matches a hit
  let findMatch = (hit) => unique.findIndex(elem => !isDifferent(elem, hit, _.get(req, 'clean.lang.iso6393') ));

  // iterate over res.data using an old-school for loop starting at index 1
  // we can call break at any time to end the iterator
  for( let i=1; i<res.data.length; i++){

    // stop iterating when requested size has been reached in unique
    if( unique.length >= req.clean.size ){ break; }

    // pointer to hit at location $i
    let hit = res.data[i];

    // if there are multiple items in results, loop through them to find a dupe
    // save off the index of the dupe if found
    let dupeIndex = findMatch(hit);

    // if a dupe is not found, just add to list of unique hits and continue
    if( dupeIndex === -1 ){ unique.push(hit); }

    // if dupe was found, we need to check which of the records is preferred
    // since the order in which Elasticsearch returns identical text matches is arbitrary
    // of course, if the new one is preferred we should replace previous with new
    else if( isPreferred( unique[dupeIndex], hit ) ) {

      // replace previous dupe item with current hit
      unique[dupeIndex] = hit;

      // logging
      logger.debug('[dupe][replacing]', {
        query: req.clean.text,
        previous: unique[dupeIndex].source,
        hit: field.getStringValue(hit.name.default) + ' ' + hit.source + ':' + hit._id
      });
    }

    // if not preferred over existing, just log and continue
    else {
      logger.debug('[dupe][skipping]', {
        query: req.clean.text,
        previous: unique[dupeIndex].source,
        hit: field.getStringValue(hit.name.default) + ' ' + hit.source + ':' + hit._id
      });
    }
  }

  // replace the original data with only the unique hits
  res.data = unique;

  next();
}

// return true if the second argument represents a hit which is preferred
// to the hit in the first argument
function isPreferred(existingHit, candidateHit) {

  // prefer a record with a postcode
  // https://github.com/pelias/api/issues/872
  if( !_.has(existingHit, 'address_parts.zip') &&
       _.has(candidateHit, 'address_parts.zip') ){ return true; }

  // prefer non-canonical sources over canonical ones
  if( !_.includes(canonical_sources, candidateHit.source) &&
       _.includes(canonical_sources, existingHit.source) ){ return true; }

  // prefer certain layers over others
  if( existingHit.layer !== candidateHit.layer && _.isArray( layerPreferences ) ){
    for( let i=0; i<layerPreferences.length; i++ ){
      if( existingHit.layer === layerPreferences[i] ){ return false; }
      if( candidateHit.layer === layerPreferences[i] ){ return true; }
    }
  }

  // prefer certain sources over others
  if( existingHit.source !== candidateHit.source ){
    switch( existingHit.source ){
      // WOF has bbox and is generally preferred
      case 'geonames': return candidateHit.source === 'whosonfirst' || candidateHit.source === 'openstreetmap';
      // addresses are generally better in OA
      case 'openstreetmap': return candidateHit.source === 'openaddresses';
      // venues are better in OSM than WOF
      case 'whosonfirst': return candidateHit.source === 'openstreetmap';
    }
  }

  // no preference, keep existing hit
  return false;
}

module.exports = function() {
  return dedupeResults;
};
