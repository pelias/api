const _ = require('lodash');

function _setup(){
  return {
    sanitize: function _sanitize( raw, clean ){
      if ( raw.dedupe === 'geo' ) { clean.dedupe = 'geo'; }
      return { errors: [], warnings: [] };
    },

    expected: function _expected() {
      // add size as a valid parameter
      return [{ name: 'dedupe' }];
    }
  };
}

// export function
module.exports = _setup;
