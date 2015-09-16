var geolib = require('geolib');


function setup() {

  return computeDistances;
}

function computeDistances(req, res, next) {

  // do nothing if no result data set
  if (!res || !res.data) {
    return next();
  }

  if ( !(req.clean.hasOwnProperty('lat') && req.clean.hasOwnProperty('lon')) ) {
    return next();
  }

  res.data.forEach(function (place) {
    // the result of getDistance is in meters, so convert to kilometers
    place.distance = geolib.getDistance(
      { latitude: req.clean.lat, longitude: req.clean.lon },
      { latitude: place.center_point.lat, longitude: place.center_point.lon }
    ) / 1000;
  });

  next();
}


module.exports = setup;
