var geolib = require('geolib');
var check = require('check-types');


function setup() {

  return computeDistances;
}

function computeDistances(req, res, next) {

  // do nothing if no result data set
  if (!res || !res.data) {
    return next();
  }

  if (!(check.number(req.clean['point.lat']) &&
        check.number(req.clean['point.lon']))) {
    return next();
  }

  var point = {
    latitude: req.clean['point.lat'],
    longitude: req.clean['point.lon']
  };

  res.data.forEach(function (place) {
    // the result of getDistance is in meters, so convert to kilometers
    place.distance = geolib.getDistance(
      point,
      { latitude: place.center_point.lat, longitude: place.center_point.lon }
    ) / 1000;
  });

  next();
}


module.exports = setup;
