const _ = require('lodash');
const placeTypes = require('./placeTypes');
const field = require('../helper/fieldValue');

/**
 * Compare the layer properties if they exist.
 * Returns false if the objects are the same, else true.
 */
function isLayerDifferent(item1, item2){
  return isPropertyDifferent(item1, item2, 'layer');
}

/**
 * Compare the parent properties if they exist.
 * Returns false if the objects are the same, else true.
 */
function isParentHierarchyDifferent(item1, item2){
  let parent1 = _.get(item1, 'parent');
  let parent2 = _.get(item2, 'parent');

  // if neither object has parent info, we consider them the same
  if( !parent1 && !parent2 ){ return false; }

  // both have parent info
  if( _.isPlainObject(parent1) && _.isPlainObject(parent2) ){

    // iterate over all the placetypes, comparing between items
    return placeTypes.some( placeType => {

      // skip the parent field corresponding to the item placetype
      if( placeType === item1.layer ){ return false; }

      // ensure the parent ids are the same for all placetypes
      return isPropertyDifferent( item1.parent, item2.parent, placeType + '_id' );
    });
  }

  // if one has parent info and the other doesn't, we consider them different
  return true;
}

/**
 * Compare the name properties if they exist.
 * Returns false if the objects are the same, else true.
 */
function isNameDifferent(item1, item2){
  let names1 = _.get(item1, 'name');
  let names2 = _.get(item2, 'name');

  // if neither object has name info, we consider them the same
  if( !names1 && !names2 ){ return false; }

  // if both have name info
  if( _.isPlainObject(names1) && _.isPlainObject(names2) ){

    // iterate over all the languages in item1, comparing between items
    return Object.keys(names1).some( lang => {

      // do not consider absence of an additional name as a difference
      // but strictly enfore that 'default' must be present and match
      if( _.has(names2, lang) || lang === 'default' ){

        // do not consider absence of an additional name as a difference
        return isPropertyDifferent(names1, names2, lang);
      }
    });
  }

  // if one has name info and the other doesn't, we consider them different
  return true;
}

/**
 * Compare the address_parts properties if they exist.
 * Returns false if the objects are the same, else true.
 */
function isAddressDifferent(item1, item2){
  let address1 = _.get(item1, 'address_parts');
  let address2 = _.get(item2, 'address_parts');

  // if neither object has address info, we consider them the same
  if( !address1 && !address2 ){ return false; }

  // if both have address info
  if( _.isPlainObject(address1) && _.isPlainObject(address2) ){

    if( isPropertyDifferent(address1, address2, 'number') ){ return true; }
    if( isPropertyDifferent(address1, address2, 'street') ){ return true; }

    // only compare zip if both records have it, otherwise just ignore and assume it's the same
    // since by this time we've already compared parent hierarchies
    if( _.has(address1, 'zip') && _.has(address2, 'zip') ){
      if( isPropertyDifferent(address1, address2, 'zip') ){ return true; }
    }

    return false;
  }

  // one has address and the other doesn't, different!
  return true;
}

/**
 * Compare the two records and return true if they differ and false if same.
 */
function isDifferent(item1, item2){
  if( isLayerDifferent( item1, item2 ) ){ return true; }
  if( isParentHierarchyDifferent( item1, item2 ) ){ return true; }
  if( isNameDifferent( item1, item2 ) ){ return true; }
  if( isAddressDifferent( item1, item2 ) ){ return true; }
  return false;
}

/**
 * return true if properties are different
 */
function isPropertyDifferent(item1, item2, prop ){

  // if neither item has prop, we consider them the same
  if( !_.has(item1, prop) && !_.has(item2, prop) ){ return false; }

  // handle arrays and other non-string values
  var prop1 = field.getStringValue( _.get( item1, prop ) );
  var prop2 = field.getStringValue( _.get( item2, prop ) );

  // compare strings
  return normalizeString(prop1) !== normalizeString(prop2);
}

/**
 * lowercase characters and remove some punctuation
 */
function normalizeString(str){
  return str.toLowerCase().split(/[ ,-]+/).join(' ');
}

module.exports.isDifferent = isDifferent;