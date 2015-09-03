var valid_types = require( '../query/indeces' );

module.exports = function calculate_types(clean_types) {
  if (!clean_types) {
    return undefined;
  }

  if (clean_types.from_layers) {
    return clean_types.from_layers;
  }

  if (clean_types.from_address_parser) {
    return clean_types.from_address_parser;
  }
};
