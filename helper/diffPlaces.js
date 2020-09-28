const _ = require('lodash');
const placeTypes = require('./placeTypes');
const canonicalLayers = require('../helper/type_mapping').getCanonicalLayers();
const field = require('../helper/fieldValue');
const removeAccents = require('remove-accents');

// only consider these layers as synonymous for deduplication purposes.
// when performing inter-layer deduping, layers coming earlier in this list take
// preference to those appearing later.
const layerPreferences = [
  'locality',
  'country',
  'localadmin',
  'county',
  'region',
  'neighbourhood',
  'macrocounty',
  'macroregion',
  'empire'
];

/**
 * Compare the layer properties if they exist.
 * Returns false if the objects are the same, else true.
 */
function isLayerDifferent(item1, item2){
  if( isPropertyDifferent(item1, item2, 'layer') ){
    // consider all custom layers to be analogous to a venue
    if( ( item1.layer === 'venue' || !_.includes( canonicalLayers, item1.layer ) ) &&
        ( item2.layer === 'venue' || !_.includes( canonicalLayers, item2.layer ) ) ){
      return false;
    }
    // consider some layers to be synonymous
    if( _.includes( layerPreferences, item1.layer ) && _.includes( layerPreferences, item2.layer ) ){
      return false;
    }
    return true;
  }
  return false;
}

/**
 * Compare the parent properties if they exist.
 * Returns false if the objects are the same, else true.
 */
function isParentHierarchyDifferent(item1, item2){
  let parent1 = _.get(item1, 'parent');
  let parent2 = _.get(item2, 'parent');

  // check if these are plain 'ol javascript objects
  let isPojo1 = _.isPlainObject(parent1);
  let isPojo2 = _.isPlainObject(parent2);

  // if neither object has parent info, we consider them the same
  if( !isPojo1 && !isPojo2 ){ return false; }

  // if only one has parent info, we consider them the same
  // note: this really shouldn't happen as at least one parent should exist
  if( !isPojo1 || !isPojo2 ){ return false; }

  // get a numerical placetype 'rank' to use for comparing parent levels
  // note: a rank of Infinity is returned if the item layer is not listed
  // in the $placeTypes array.
  let rank1 = getPlaceTypeRank(item1);
  let rank2 = getPlaceTypeRank(item2);

  // $maxRank defines the maximum rank level which we will consider for
  // equality matching between the two records.
  // note: by default we check all ranks
  let maxRank = Infinity;

  // if both records are at the same rank then only check lower ranks
  if (rank1 === rank2 && rank1 !== Infinity) {
    maxRank = rank1 - 1;
  }

  // if the records have different ranks then check ranks lower than
  // the lowest rank of the two (inclusive).
  else {
    maxRank = Math.min(rank1, rank2);
  }

  // iterate over all the placetypes, comparing values from the items
  return placeTypes.some((placeType, rank) => {

    // skip layers that are more granular than $maxRank
    if (rank > maxRank){ return false; }

    // ensure the parent ids are the same for all placetypes
    return isPropertyDifferent( item1.parent, item2.parent, `${placeType}_id` );
  });
}

/**
 * Compare the name properties if they exist.
 * Returns false if the objects are the same, else true.
 */
function isNameDifferent(item1, item2, requestLanguage){
  let names1 = _.get(item1, 'name');
  let names2 = _.get(item2, 'name');

  // check if these are plain 'ol javascript objects
  let isPojo1 = _.isPlainObject(names1);
  let isPojo2 = _.isPlainObject(names2);

  // if neither object has name info, we consider them the same
  if( !isPojo1 && !isPojo2 ){ return false; }

  // if only one has name info, we consider them the same
  // note: this really shouldn't happen as name is a mandatory field
  if( !isPojo1 || !isPojo2 ){ return false; }

  // else both have name info

  // iterate over all the languages in item2, comparing them to the
  // 'default' name of item1 and also against the language requested by the user.
  for( let lang in names2 ){
    if( !isPropertyDifferent({[lang]: names1.default}, names2, lang) ){ return false; }
    if( requestLanguage && !isPropertyDifferent({[lang]: names1[requestLanguage]}, names2, lang) ){ return false; }
  }

  // iterate over all the languages in item1, comparing them to the
  // 'default' name of item2 and also against the language requested by the user.
  for( let lang in names1 ){
    if( !isPropertyDifferent({[lang]: names2.default}, names1, lang) ){ return false; }
    if( requestLanguage && !isPropertyDifferent({[lang]: names2[requestLanguage]}, names1, lang) ){ return false; }
  }

  return true;
}

/**
 * Compare the address_parts properties if they exist.
 * Returns false if the objects are the same, else true.
 */
function isAddressDifferent(item1, item2){
  let address1 = _.get(item1, 'address_parts');
  let address2 = _.get(item2, 'address_parts');

  // check if these are plain 'ol javascript objects
  let isPojo1 = _.isPlainObject(address1);
  let isPojo2 = _.isPlainObject(address2);

  // if neither object has address info, we consider them the same
  if( !isPojo1 && !isPojo2 ){ return false; }

  // if only one has address info, we consider them the same
  if( !isPojo1 || !isPojo2 ){ return false; }

  // else both have address info
  if( isPropertyDifferent(address1, address2, 'number') ){ return true; }
  if( isPropertyDifferent(address1, address2, 'street') ){ return true; }

  // only compare zip if both records have it, otherwise just ignore and assume it's the same
  // since by this time we've already compared parent hierarchies
  if( _.has(address1, 'zip') && _.has(address2, 'zip') ){
    if( isPropertyDifferent(address1, address2, 'zip') ){ return true; }
  }

  return false;
}

/**
 * Compare the two records and return true if they differ and false if same.
 * Optionally provide $requestLanguage (req.clean.lang.iso6393) to improve name deduplication.
 */
function isDifferent(item1, item2, requestLanguage){
  if( isLayerDifferent( item1, item2 ) ){ return true; }
  if( isParentHierarchyDifferent( item1, item2 ) ){ return true; }
  if( isNameDifferent( item1, item2, requestLanguage ) ){ return true; }
  if( isAddressDifferent( item1, item2 ) ){ return true; }
  return false;
}

/**
 * return true if properties are different
 */
function isPropertyDifferent(item1, item2, prop ){

  // if neither item has prop, we consider them the same
  if( !_.has(item1, prop) && !_.has(item2, prop) ){ return false; }

  // read property values, casting scalar values to arrays
  var prop1 = field.getArrayValue( _.get( item1, prop ) );
  var prop2 = field.getArrayValue( _.get( item2, prop ) );

  // iterate over all properties in both sets, comparing each
  // item in turn, return false on first match.
  // handles non-string values
  for( let i=0; i<prop1.length; i++ ){
    let prop1StringValue = field.getStringValue( prop1[i] );
    for( let j=0; j<prop2.length; j++ ){
      let prop2StringValue = field.getStringValue( prop2[j] );
      if( normalizeString( prop1StringValue ) === normalizeString( prop2StringValue ) ){
        return false;
      }
    }
  }

  // we did not find any matching values, consider them different
  return true;
}

/**
 * return a numeric place rank based on the item layer
 *
 * the $placeTypes array is listed in ascending granularity.
 * the array position of each placetype is used as a 'rank' in order
 * have a mathematical way of comparing which levels are more, or less
 * granular than others:
 *
 * 0: ocean
 * 2: continent
 * ...
 * 11: locality
 * 13: neighbourhood
 * 
 * note: Infinity is returned if layer not found in array, this is in
 * order to ensure that a high value is returned rather than the 
 * default '-1' value returned for misses when using findIndex().
 */
function getPlaceTypeRank(item) {
  const rank = placeTypes.findIndex(pt => pt === _.get(item, 'layer'));
  return (rank > -1) ? rank : Infinity;
}

/**
 * lowercase characters and remove some punctuation
 */
function normalizeString(str){
  return removeAccents(str.toLowerCase().split(/[ ,-]+/).join(' '));
}

module.exports.isDifferent = isDifferent;
module.exports.layerPreferences = layerPreferences;
