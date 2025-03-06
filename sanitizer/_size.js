const _ = require('lodash');
const peliasConfig = require('pelias-config').generate().api;
//Allow custom min, max and default sizes
const MIN_SIZE = peliasConfig.minSize || 1;
const MAX_SIZE = peliasConfig.maxSize || 40;
let default_size_init;
if (peliasConfig.DEFAULT_SIZE) {
  //Cant be smaller/bigger than min/max due to validation in schema.js
  default_size_init = peliasConfig.DEFAULT_SIZE;
}
else if (MIN_SIZE > 10) {
  default_size_init = MIN_SIZE;
}
else if (MAX_SIZE < 10) {
  default_size_init = MAX_SIZE;
}
else {
  default_size_init = 10;
}
const DEFAULT_SIZE =default_size_init;



// validate inputs, convert types and apply defaults
function _setup(size_min, size_max, size_def) {

  // allow caller to inject custom min/max/default values
  if (!_.isFinite(size_min)) { size_min = MIN_SIZE; }
  if (!_.isFinite(size_max)) { size_max = MAX_SIZE; }
  if (!_.isFinite(size_def)) { size_def = default_size_init; }

  return {
    sanitize: function _sanitize(raw, clean) {

      // error & warning messages
      var messages = { errors: [], warnings: [] };

      // coercions
      clean.size = parseInt(raw.size, 10);

      // invalid numeric input
      if (isNaN(clean.size)) {
        clean.size = size_def;
      }
      // ensure size falls within defined range
      else if (clean.size > size_max) {
        // set the max size
        messages.warnings.push('out-of-range integer \'size\', using MAX_SIZE');
        clean.size = size_max;
      }
      else if (clean.size < size_min) {
        // set the min size
        messages.warnings.push('out-of-range integer \'size\', using MIN_SIZE');
        clean.size = size_min;
      }

      return messages;
    },

    expected: function _expected() {
      // add size as a valid parameter
      return [{ name: 'size' }];
    }
  };
}

// export function
module.exports = _setup;
