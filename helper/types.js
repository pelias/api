var type_mapping = require( '../helper/type_mapping' );

/**
 * Calculate the set-style intersection of two arrays
 */
var intersection = function intersection(set1, set2) {
  return set2.filter(function(value) {
    return set1.indexOf(value) !== -1;
  });
};

/**
 * Combine all types and determine the unique subset
 *
 * @param {Array} clean_types
 * @returns {Array}
 */
module.exports = function calculate_types(clean_types) {
  if (!clean_types || !(clean_types.from_layers || clean_types.from_sources || clean_types.from_address_parser)) {
    throw new Error('clean_types should not be null or undefined');
  }

  /* the layers and source parameters are cumulative:
   * perform a set intersection of their specified types
   */
  if (clean_types.from_layers || clean_types.from_sources) {
    var types = type_mapping.types;

    if (clean_types.from_layers) {
      types = intersection(types, clean_types.from_layers);
    }

    if (clean_types.from_sources) {
      types = intersection(types, clean_types.from_sources);
    }

    return types;
  }

  /*
   * Type restrictions requested by the address parser should only be used
   * if both the source and layers parameters are empty, so do this last
   */
  if (clean_types.from_address_parser) {
    return clean_types.from_address_parser;
  }

  throw new Error('no types specified');
};
