var valid_types = require( '../query/types' );

/**
 * Calculate the set-style intersection of two arrays
 */
var intersection = function intersection(set1, set2) {
  return set2.filter(function(value) {
      return set1.indexOf(value) !== -1;
  });
};

module.exports = function calculate_types(clean_types) {
  if (!clean_types) {
    return undefined;
  }

  /* the layers and source parameters are cumulative:
   * perform a set insersection of their specified types
   */
  if (clean_types.from_layers || clean_types.from_source) {
    var types = valid_types;

    if (clean_types.from_layers) {
      types = intersection(types, clean_types.from_layers);
    }

    if (clean_types.from_source) {
      types = intersection(types, clean_types.from_source);
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
};
