var geolib = require('geolib');
var check = require('check-types');
var iterate = require('../helper/iterate');


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
  if (!res || !res.results) {
    return next();
  }

  iterate(res.results, req.clean, function(r, clean, i) {
    var data = r.data;
    if (!data || !(check.number(clean[opts.prefix + 'lat']) &&
                     check.number(clean[opts.prefix + 'lon']))) {
      return;
    }

    var point = {
      latitude: clean[opts.prefix + 'lat'],
      longitude: clean[opts.prefix + 'lon']
    };

    data.forEach(function (place) {
      // the result of getDistance is in meters, so convert to kilometers
      place.distance = geolib.getDistance(
        point,
        { latitude: place.center_point.lat, longitude: place.center_point.lon }
      ) / 1000;
    });
  });

  next();
}


module.exports = setup;
