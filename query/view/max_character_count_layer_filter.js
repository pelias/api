const _ = require('lodash');
const peliasQuery = require('pelias-query');
const allLayers = require('../../helper/type_mapping').layers;

/**
  Layer terms filter view which counts the length of 'input:name' and only
  applies the filter condition if the text is shorter than or equal to $maxCharCount.

  You must provide a list of $excludedLayers, all layers listed in the type mapping
  will be targeted, minus any listed in $excludedLayers.

  eg. to filter by 'layer=address' for all one & two digit inputs:
  view = filter(['address'],2)
**/

// lowest and highest valid character count (enforced)
const MIN_CHAR_COUNT = 1;
const MAX_CHAR_COUNT = 99;

module.exports = function( excludedLayers, maxCharCount ) {

  // validate args, return no-op view if invalid
  if( !_.isArray(excludedLayers) || _.isEmpty(excludedLayers) ||
      !_.isNumber(maxCharCount) || maxCharCount === 0 ){
    return () => null;
  }

  // create an array containing all layers minus excluded layers
  let includedLayers = _.difference(allLayers, excludedLayers);

  // included layers is equal to all layers, return no-op view
  if( includedLayers.length === allLayers.length ){
    return () => null;
  }

  // create a new VariableStore with only the layers property
  var vsWithOnlyIncludedLayers = new peliasQuery.Vars({ 'layers': includedLayers });

  // ensure char count is within a reasonable range
  maxCharCount = _.clamp(maxCharCount, MIN_CHAR_COUNT, MAX_CHAR_COUNT);

  return function( vs ){

    // validate required params
    if( !vs.isset('input:name') ){
      return null;
    }

    // enforce maximum character length
    let charCount = vs.var('input:name').toString().length;
    if( !_.inRange(charCount, 1, maxCharCount+1) ){
      return null;
    }

    // use existing 'layers' query
    return peliasQuery.view.layers(vsWithOnlyIncludedLayers);
  };
};
