// function deg2rad(degrees) {
// 	return Math.PI*degrees/180;
// }

// function rad2deg(radians) {
// 	return 180.0*radians/Math.PI;
// }

// // Semi-axes of WGS-84 geoidal reference
// var WGS84_a = 6378137.0;  // Major semiaxis [m]
// var WGS84_b = 6356752.3;  // Minor semiaxis [m]

// // Earth radius at a given latitude, according to the WGS-84 ellipsoid [m]
// function WGS84EarthRadius(lat){
// 	// http://en.wikipedia.org/wiki/Earth_radius
//     var An = WGS84_a*WGS84_a * Math.cos(lat);
//     var Bn = WGS84_b*WGS84_b * Math.sin(lat);
//     var Ad = WGS84_a * Math.cos(lat);
//     var Bd = WGS84_b * Math.sin(lat);
//     return Math.sqrt( (An*An + Bn*Bn)/(Ad*Ad + Bd*Bd) );
// }
    
// // Bounding box surrounding the point at given coordinates,
// // assuming local approximation of Earth surface as a sphere
// // of radius given by WGS84
// function boundingBox(latitudeInDegrees, longitudeInDegrees, halfSideInKm) {
// 	var lat = deg2rad(latitudeInDegrees);
//     var lon = deg2rad(longitudeInDegrees);
//     var halfSide = 1000*halfSideInKm;

//     // Radius of Earth at given latitude
//     var radius = WGS84EarthRadius(lat);
//     // Radius of the parallel at given latitude
//     var pradius = radius*Math.cos(lat);

//     var latMin = lat - halfSide/radius;
//     var latMax = lat + halfSide/radius;
//     var lonMin = lon - halfSide/pradius;
//     var lonMax = lon + halfSide/pradius;

//     return {
//     	'bottom_left': {
//     		'lat': rad2deg(latMin), 
//     		'lon': rad2deg(lonMin)
//     	},
//     	'top_right': {
//     		'lat': rad2deg(latMax), 
//     		'lon': rad2deg(lonMax)	
//     	} 
//     };
// }
    


// // middleware
// function middleware(req, res, next){
//   req.clean = req.clean || {};
//   // ideally, bbox should be part of the req (and not to be calculated)
//   // TBD
//   req.clean.bbox = boundingBox(req.query.lat, req.query.lon, 20);
//   next();
// }

// // middleware
// module.exports.middleware = middleware