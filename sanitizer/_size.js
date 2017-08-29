var check = require('check-types');

var MIN_SIZE = 1,
    MAX_SIZE = 40,
    DEFAULT_SIZE = 10;

// validate inputs, convert types and apply defaults
function _setup( size_min, size_max, size_def ){

  // allow caller to inject custom min/max/default values
  if( !check.number( size_min ) ){ size_min = MIN_SIZE; }
  if( !check.number( size_max ) ){ size_max = MAX_SIZE; }
  if( !check.number( size_def ) ){ size_def = DEFAULT_SIZE; }

  return {
    sanitize: function _sanitize( raw, clean ){

      // error & warning messages
      var messages = { errors: [], warnings: [] };

      // coercions
      clean.size = parseInt( raw.size, 10 );

      // invalid numeric input
      if( isNaN( clean.size ) ){
        clean.size = size_def;
      }
      // ensure size falls within defined range
      else if( clean.size > size_max ){
        // set the max size
        messages.warnings.push('out-of-range integer \'size\', using MAX_SIZE');
        clean.size = size_max;
      }
      else if( clean.size < size_min ){
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
