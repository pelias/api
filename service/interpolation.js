
var logger = require( 'pelias-logger' ).get( 'api' ),
    request = require( 'superagent' ),
    peliasConfig = require( 'pelias-config' );

/**

  street address interpolation service client

  this file provides several different 'transports' which can be used to access the interpolation
  service, either directly from disk or via a network connnection.

  the exported method for this module checks pelias-config for a configuration block such as:

  "interpolation": {
    "client": {
      "adapter": "http",
      "host": "http://localhost:4444"
    }
  }

  for more info on running the service see: https://github.com/pelias/interpolation

**/

/**
  NullTransport

  disables the service completely
**/
function NullTransport(){}
NullTransport.prototype.query = function( coord, number, street, cb ){
  cb(); // no-op
};

/**
  RequireTransport

  allows the api to be used by simply requiring the module
**/
function RequireTransport( addressDbPath, streetDbPath ){
  try {
    var lib = require('pelias-interpolation'); // lazy load dependency
    this.query = lib.api.search( addressDbPath, streetDbPath );
  } catch( e ){
    logger.error( 'RequireTransport: failed to connect to interpolation service' );
  }
}
RequireTransport.prototype.query = function( coord, number, street, cb ){
  throw new Error( 'interpolation: transport not connected' );
};

/**
  HttpTransport

  allows the api to be used via a remote web service
**/
function HttpTransport( host, settings ){
  this.query = function( coord, number, street, cb ){
    request
      .get( host + '/search/geojson' )
      .set( 'Accept', 'application/json' )
      .query({ lat: coord.lat, lon: coord.lon, number: number, street: street })
      .timeout( settings && settings.timeout || 1000 )
      .end( function( err, res ){
        if( err || !res ){ return cb( err ); }
        if( 200 !== res.status ){ return cb( 'non 200 status' ); }
        return cb( null, res.body );
      });
  };
}
HttpTransport.prototype.query = function( coord, number, street, cb ){
  throw new Error( 'interpolation: transport not connected' );
};

/**
  Setup

  allows instantiation of transport depending on configuration and preference
**/
module.exports.search = function setup(){

  // user config
  var config = peliasConfig.generate();

  // ensure config variables set correctly
  if( !config.hasOwnProperty('interpolation') || !config.interpolation.hasOwnProperty('client') ){
    logger.warn( 'interpolation: configuration not found' );
  }

  // valid configuration found
  else {

    // get adapter settings from config
    var settings = config.interpolation.client;

    // http adapter
    if( 'http' === settings.adapter && settings.hasOwnProperty('host') ){
      logger.info( 'interpolation: using http transport:', settings.host );
      if( settings.hasOwnProperty('timeout') ){
        return new HttpTransport( settings.host, { timeout: parseInt( settings.timeout, 10 ) } );
      }
      return new HttpTransport( settings.host );
    }

    // require adapter
    else if( 'require' === settings.adapter ){
      if( settings.hasOwnProperty('streetdb') && settings.hasOwnProperty('addressdb') ){
        logger.info( 'interpolation: using require transport' );
        return new RequireTransport( settings.addressdb, settings.streetdb );
      }
    }
  }

  // default adapter
  logger.info( 'interpolation: using null transport' );
  return new NullTransport();
};
