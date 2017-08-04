const _ = require('lodash');
/**
Set a focus.lat and focus.lon if specified in pelias config
* @param {object} defaultParameters property of pelias config
*/

function _setup(defaultParameters){
  return {
    sanitize: function sanitize(raw, clean){
  /*
  check that:
  1. {object} raw exists
  2. pelias-config included the properties focus.point.lat and focus.point.lon
  3. raw.focus.point.lon and raw.focus.point.lat have not been set
  */
      if (!_.isUndefined(raw) &&
        !_.isUndefined(defaultParameters['focus.point.lat']) &&
        !_.isUndefined(defaultParameters['focus.point.lon']) &&
        !_.has(raw, 'focus.point.lon') &&
        !_.has(raw, 'focus.point.lat') ) {

        raw['focus.point.lat'] = defaultParameters['focus.point.lat'];
        raw['focus.point.lon'] = defaultParameters['focus.point.lon'];
      }

      return { errors: [], warnings: [] };
    }
  };
}

// if focus.point.lat and focus.point.lon already exists, don't change
module.exports = _setup;
