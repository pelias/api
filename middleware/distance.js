var geolib = require('geolib');
var check = require('check-types');


function setup(prefix) {

  return function (req, res, next) {
    var opts = {
      prefix: prefix || 'point.'
    };
    return computeDistances(req, res, next, opts);
  };
}

function computeDistances(req, res, next, opts) {

  // do nothing if no result data set
  if (!res || !res.data) {
    return next();
  }

  if (!(check.number(req.clean[opts.prefix + 'lat']) &&
        check.number(req.clean[opts.prefix + 'lon']))) {
    return next();
  }

  var point = {
    latitude: req.clean[opts.prefix + 'lat'],
    longitude: req.clean[opts.prefix + 'lon']
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
