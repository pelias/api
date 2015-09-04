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

  if (clean_types.from_address_parser) {
    return clean_types.from_address_parser;
  }
};
