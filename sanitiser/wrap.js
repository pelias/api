
/**
  normalize co-ordinates that lie outside of the normal ranges.
**/

function wrap( lat, lon ){

  var flip = false;
  var point = { lat: lat, lon: lon };

  // north pole
  if( point.lat > 90 ){
    point.lat = 90 - point.lat % 90;
    point.lon += 180;
  }

  // south pole
  else if( point.lat < -90 ){
    point.lat = -90 - point.lat % 90;
    point.lon += 180;
  }

  // reduce lon
  while( point.lon > 180 ){
    point.lon -= 360;
  }

  // increase lon
  while( point.lon < -180 ){
    point.lon += 360;
  }

  return point;
}

module.exports = wrap;
