const logger = require('pelias-logger').get('api');
const _ = require('lodash');
const isDifferent = require('../helper/diffPlaces').isDifferent;
const layerPreferences = require('../helper/diffPlaces').layerPreferences;
const canonical_sources = require('../helper/type_mapping').canonical_sources;
const field = require('../helper/fieldValue');

// convenience function to pretty print hits
const formatLog = (hit) => {
  const name = field.getStringValue(_.get(hit, 'name.default'));
  const zip = field.getStringValue(_.get(hit, 'address_parts.zip'));
  return [name, zip, hit._id].filter(Boolean).join(' ');
};

/**
 * Deduplication workflow:
 *
 * 1. iterate over results starting at position 0
 * 2. on each iteration search for duplicate candidates:
 *  2.1  at higher positions in array
 *  2.2  not contained in the skip-list
 * 3. from the list of candidates, select a preferred master record
 * 4. push master record on to return array
 * 5. add non-master candidates to a skip-list
 * 6. continue down list until end
 */

function dedupeResults(req, res, next) {

  // do nothing if request data is invalid
  if( _.isUndefined(res) || !_.isPlainObject(req.clean) ){ return next(); }

  // do nothing if no result data is invalid
  if( _.isUndefined(res) || !_.isArray(res.data) || _.isEmpty(res.data) ){ return next(); }

  // loop through data items and only copy unique items to unique
  const unique = [];

  // maintain a skip-list
  const skip = [];

  // use the user agent language to improve deduplication
  const lang = _.get(req, 'clean.lang.iso6393');

  // 1. iterate over res.data
  res.data.forEach((place, ppos) => {

    // skip records in the skip-list
    if (skip.includes(place)){ return; }

    // 2. search for duplicate candidates
    const candidates = res.data.filter((candidate, cpos) => {

      // 2.1 at higher positions in array
      if (cpos <= ppos) { return false; }

      // 2.2 not contained in the skip-list
      if (skip.includes(candidate)) { return false; }

      // true if the two records are considered duplicates
      return !isDifferent(place, candidate, lang);
    });

    // 3. select a preferred master record

    // simple case where no candidates were found
    if (candidates.length === 0){
      unique.push(place);
      return;
    }

    // by default we consider the candidate with the lowest index as master
    let master = place;

    // iterate over candidates looking for one which is preferred to
    // the currently selected master
    candidates.forEach(candidate => {
      if (isPreferred(master, candidate)){
        master = candidate;
      }
    });

    // logging
    if (master !== place) {
      logger.debug('[dupe][replacing]', {
        query: req.clean.text,
        previous: formatLog(place),
        hit: formatLog(master)
      });
    }

    // 4. push master record on to return array
    unique.push(master);

    // 5. add non-master candidates to a skip-list
    candidates.forEach(candidate => {
      skip.push(candidate);
    });
  });

  // replace the original data with only the unique hits
  const maxElements = _.get(req, 'clean.size', undefined);
  res.data = unique.slice(0, maxElements);

  next();
}

// return true if the second argument represents a hit which is preferred
// to the hit in the first argument
function isPreferred(existingHit, candidateHit) {

  // prefer a record with a postcode
  // https://github.com/pelias/api/issues/872
  if( !_.has(existingHit, 'address_parts.zip') &&
       _.has(candidateHit, 'address_parts.zip') ){ return true; }
  // if the existing hit HAS a postcode, and this candidate does NOT, keep the existing hit
  if( _.has(existingHit, 'address_parts.zip') &&
       !_.has(candidateHit, 'address_parts.zip') ){ return false; }

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
