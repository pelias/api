const _ = require('lodash');
const DEFAULT_SORT = 'distance';

const allowed_values = ['distance', 'popularity'];

function _setup(){

  return {
    sanitize: function _sanitize( raw, clean ){

      // error & warning messages
      var messages = { errors: [], warnings: [] };

      clean.sort = raw.sort;
      
      if( clean.sort && !allowed_values.includes(clean.sort) ){
        messages.warnings.push('invalid \'sort\', using \'distance\'');
        clean.sort = DEFAULT_SORT;
      }

      return messages;
    },

    expected: function _expected() {
      // add size as a valid parameter
      return [{ name: 'sort' }];
    }
  };
}

// export function
module.exports = _setup;
