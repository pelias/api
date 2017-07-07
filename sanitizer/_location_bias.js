const _ = require('lodash');
/**
Set a focus.lat and focus.lon if specified in pelias config
* @param {object} defaultParameters property of pelias config
*/

function setup(defaultParameters){

  return function setLocationBias(raw, clean){
    if (!_.isUndefined(raw) &&
      !_.isUndefined(defaultParameters['focus.point.lat']) &&
      !_.isUndefined(defaultParameters['focus.point.lon'])) {

      raw['focus.point.lat'] = defaultParameters['focus.point.lat'];
      raw['focus.point.lon'] = defaultParameters['focus.point.lon'];
    }

    return { errors: [], warnings: [] };
  };
}


module.exports = setup;
