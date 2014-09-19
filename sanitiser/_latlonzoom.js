// validate inputs, convert types and apply defaults
function sanitize( req ){
  
  var clean = req.clean || {};
  var params= req.query;

  // ensure the input params are a valid object
  if( Object.prototype.toString.call( params ) !== '[object Object]' ){
    params = {};
  }

  // lat
  var lat = parseFloat( params.lat, 10 );
  if( isNaN( lat ) || lat < 0 || lat > 90 ){
    return {
      'error': true,
      'message': 'invalid param \'lat\': must be >0 and <90' 
    }
  }
  clean.lat = lat;

  // lon
  var lon = parseFloat( params.lon, 10 );
  if( isNaN( lon ) || lon < -180 || lon > 180 ){
    return {
      'error': true,
      'message': 'invalid param \'lon\': must be >-180 and <180' 
    }
  }
  clean.lon = lon;

  // zoom level
  var zoom = parseInt( params.zoom, 10 );
  if( !isNaN( zoom ) ){
    clean.zoom = Math.min( Math.max( zoom, 1 ), 18 ); // max
  } else {
    clean.zoom = 10; // default
  }

  req.clean = clean;
  
  return { 'error': false };

}

// export function
module.exports = sanitize;
