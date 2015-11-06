var type_mapping = require( '../helper/type_mapping' );
var _ = require('lodash');

/**
 * Different parts of the code express "preferences" for which Elasticsearch types are going to be searched
 * This method decides how to combine all the preferences.
 *
 * @param {Array} clean_types
 * @returns {Array}
 */
module.exports = function calculate_types(clean_types) {
  //Check that at least one preference of types is defined
  if (!clean_types || !(clean_types.from_layers || clean_types.from_sources || clean_types.from_text_parser)) {
    throw new Error('clean_types should not be null or undefined');
  }

  /* the layers and source parameters are cumulative:
   * perform a set intersection of their specified types
   */
  if (clean_types.from_layers || clean_types.from_sources) {
    var types = type_mapping.types;

    if (clean_types.from_layers) {
      types = _.intersection(types, clean_types.from_layers);
    }

    if (clean_types.from_sources) {
      types = _.intersection(types, clean_types.from_sources);
    }

    return types;
  }

  /*
   * Type restrictions requested by the address parser should only be used
   * if both the source and layers parameters are empty, so do this last
   */
  if (clean_types.from_text_parser) {
    return clean_types.from_text_parser;
  }

  throw new Error('no types specified');
};
