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

function dedupeResults(req, res, next) {

  // do nothing if request data is invalid
  if( _.isUndefined(res) || !_.isPlainObject(req.clean) ){ return next(); }

  // do nothing if no result data is invalid
  if( _.isUndefined(res) || !_.isArray(res.data) || _.isEmpty(res.data) ){ return next(); }

  // use the user agent language to improve deduplication
  const lang = _.get(req, 'clean.lang.iso6393');

  // maintain a set of inferior records (by their array offsets)
  const inferior = new Set();
  for (var i = 0; i < (res.data.length-1); i++) {
    for (var j = (i+1); j < res.data.length; j++) {

      // ensure these two records are considered duplicates
      if (isDifferent(res.data[i], res.data[j], lang)) { continue; }

      // decide which of the two records was 'inferior'
      // note: $preference equals true when $j is preferred and vice versa
      const preference = isPreferred(res.data[i], res.data[j]);
      inferior.add(preference ? i : j);

      // logging
      logger.debug('[dupe][replacing]', {
        query: req.clean.text,
        superior: formatLog(res.data[preference ? j : i]),
        inferior: formatLog(res.data[preference ? i : j]),
      });
    }
  }

  // remove inferior records, return the remaining results
  const unique = res.data.filter((v, o) => !inferior.has(o));
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
