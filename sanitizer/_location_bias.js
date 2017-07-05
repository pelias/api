/*
Set a focus.lat and focus.lon if specified in pelias config
*/
var _ = require('lodash');

function setup(defaultParameters){
  return function setLocationBias(req, res, next){
    if (_.isUndefined(req.clean) ||
      _.isUndefined(defaultParameters['focus.point.lat']) ||
      _.isUndefined(defaultParameters['focus.point.lon'])) {
      return next();
    }
    req.clean['focus.point.lat'] = defaultParameters['focus.point.lat'];
    req.clean['focus.point.lon'] = defaultParameters['focus.point.lon'];
    next();
  };
}


module.exports = setup;
