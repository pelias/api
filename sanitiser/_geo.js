var isObject = require('is-object');

// validate inputs, convert types and apply defaults
function sanitize( req, latlon_is_required ){
  
  var clean = req.clean || {};
  var params= req.query;
  latlon_is_required = latlon_is_required || false;

  // ensure the input params are a valid object
  if( !isObject( params ) ){
    params = {};
  }

  var is_invalid_lat = function(lat) {
    return isNaN( lat ) || lat < -90 || lat > 90;
  };

  var is_invalid_lon = function(lon) {
    return isNaN( lon ) || lon < -180 || lon > 180;
  };

  // lat
  var lat = parseFloat( params.lat, 10 );
  if (!isNaN(lat)) {
    if( is_invalid_lat(lat) ){
      return {
        'error': true,
        'message': 'invalid param \'lat\': must be >-90 and <90'
      };
    }
    clean.lat = lat;
  } else if (latlon_is_required) {
    return {
      'error': true,
      'message': 'missing param \'lat\': must be >-90 and <90'
    };
  }

  // lon
  var lon = parseFloat( params.lon, 10 );
  if (!isNaN(lon)) {
    if( is_invalid_lon(lon) ){
      return {
        'error': true,
        'message': 'invalid param \'lon\': must be >-180 and <180'
      };
    }
    clean.lon = lon;
  } else if (latlon_is_required) {
    return {
      'error': true,
      'message': 'missing param \'lon\': must be >-180 and <180'
    };
  }

  // zoom level
  var zoom = parseInt( params.zoom, 10 );
  if( !isNaN( zoom ) ){
    clean.zoom = Math.min( Math.max( zoom, 1 ), 18 ); // max
  } 

  // bbox 
  // bbox = bottom_left lat, bottom_left lon, top_right lat, top_right lon
  // bbox = left,bottom,right,top
  // bbox = min Longitude , min Latitude , max Longitude , max Latitude 
  if (params.bbox) {
    var bbox = [];
    var bboxArr = params.bbox.split(',');
    if( Array.isArray(bboxArr) && bboxArr.length === 4 ) {
      bbox = bboxArr.filter(function(latlon, index) {
        latlon = parseFloat(latlon, 10);
        return !(index % 2 === 0 ? is_invalid_lat(latlon) : is_invalid_lon(latlon)); 
      });
      if (bbox.length === 4) {
        clean.bbox = {
          top   : Math.max(bbox[0], bbox[2]),
          right : Math.max(bbox[1], bbox[3]),
          bottom: Math.min(bbox[0], bbox[2]),
          left  : Math.min(bbox[1], bbox[3])
        };
      } else {
        return {
          'error': true,
          'message': 'invalid bbox'
        };
      }
    }
  } 

  req.clean = clean;
  
  return { 'error': false };

}

// export function
module.exports = sanitize;
