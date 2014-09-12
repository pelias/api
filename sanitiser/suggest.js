
var logger = require('../src/logger'),
    indeces = require('../query/indeces');

// validate inputs, convert types and apply defaults
function sanitize( params, cb ){

  var clean = {};

  // ensure the input params are a valid object
  if( Object.prototype.toString.call( params ) !== '[object Object]' ){
    params = {};
  }

  // input text
  if('string' !== typeof params.input || !params.input.length){
    return cb( 'invalid input text length, must be >0' );
  }
  clean.input = params.input;

  // total results
  var size = parseInt( params.size, 10 );
  if( !isNaN( size ) ){
    clean.size = Math.min( size, 40 ); // max
  } else {
    clean.size = 10; // default
  }

  // which layers to query
  if('string' === typeof params.layers && params.layers.length){
    var layers = params.layers.split(',').map( function( layer ){
      return layer.toLowerCase(); // lowercase inputs
    });
    for( var x=0; x<layers.length; x++ ){
      if( -1 === indeces.indexOf( layers[x] ) ){
        return cb( 'invalid layer, must be one or more of ' + layers.join(',') );
      }
    }
    clean.layers = layers;
  }
  else {
    clean.layers = indeces; // default (all layers)
  }

  // lat
  var lat = parseFloat( params.lat, 10 );
  if( isNaN( lat ) || lat < 0 || lat > 90 ){
    return cb( 'invalid lat, must be >0 and <90' );
  }
  clean.lat = lat;

  // lon
  var lon = parseFloat( params.lon, 10 );
  if( isNaN( lon ) || lon < -180 || lon > 180 ){
    return cb( 'invalid lon, must be >-180 and <180' );
  }
  clean.lon = lon;

  // zoom level
  var zoom = parseInt( params.zoom, 10 );
  if( !isNaN( zoom ) ){
    clean.zoom = Math.min( zoom, 18 ); // max
  } else {
    clean.zoom = 10; // default
  }

  return cb( undefined, clean );

}

module.exports = function( req, res, next ){
  sanitize( req.query, function( err, clean ){
    if( err ){ next( err ); }
    req.clean = clean;
    next();
  });
};