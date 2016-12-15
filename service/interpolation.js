
var logger = require( 'pelias-logger' ).get( 'api' );

/**

  street address interpolation service

  see: https://github.com/pelias/interpolation

**/

/**
  RequireTransport

  allows the api to be used by simply requiring the module
**/
function RequireTransport( addressDbPath, streetDbPath ){
  try {
    var lib = require('pelias-interpolation');
    this.query = lib.api.search( addressDbPath, streetDbPath );
  } catch( e ){
    logger.error( 'RequireTransport: failed to connect to interpolation service' );
  }
}
RequireTransport.prototype.query = function( coord, number, street, cb ){
  throw new Error( 'transport not connected' );
};

/**
  HttpTransport

  allows the api to be used via a remote web service
**/
function HttpTransport( host ){
  var request = require('superagent');
  this.query = function( coord, number, street, cb ){
    request
      .get( host + '/search/geojson' )
      .set( 'Accept', 'application/json' )
      .query({ lat: coord.lat, lon: coord.lon, number: number, street: street })
      .end( function( err, res ){
        if( err || !res ){ return cb( err ); }
        return cb( null, res.body );
      });
  };
}
HttpTransport.prototype.query = function( coord, number, street, cb ){
  throw new Error( 'transport not connected' );
};

/**
  Setup

  allows instantiation of transport depending on configuration and preference
**/
module.exports = function setup(){
  return new HttpTransport( 'http://interpolation.wiz.co.nz' );
};
