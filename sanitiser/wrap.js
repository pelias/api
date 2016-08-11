
/**
  normalize co-ordinates that lie outside of the normal ranges.

  longitude wrapping simply requires adding +- 360 to the value until it comes
  in to range.

  for the latitude values we need to flip the longitude whenever the latitude
  crosses a pole.
**/


function wrap( lat, lon ){

  var point = { lat: lat, lon: lon };
  var quadrant = Math.floor( Math.abs(lat) / 90) % 4;
  var pole = ( lat > 0 ) ? 90 : -90;
  var offset = lat % 90;

  switch( quadrant ){
    case 0:
      point.lat = offset;
      break;
    case 1:
      point.lat = pole - offset;
      point.lon += 180;
      break;
    case 2:
      point.lat = -offset;
      point.lon += 180;
      break;
    case 3:
      point.lat = -pole + offset;
      break;
  }

  if( point.lon > 180 || point.lon <= -180 ){
    point.lon -= Math.floor(( point.lon + 180 ) / 360) * 360;
  }

  return point;
}

module.exports = wrap;
