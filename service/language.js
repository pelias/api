
var logger = require( 'pelias-logger' ).get( 'api' ),
    request = require( 'superagent' ),
    peliasConfig = require( 'pelias-config' );

/**

  language subsitution service client

  this file provides a 'transport' which can be used to access the language
  service via a network connnection.

  the exported method for this module checks pelias-config for a configuration block such as:

  "language": {
    "client": {
      "adapter": "http",
      "host": "http://localhost:6100"
    }
  }

  for more info on running the service see: https://github.com/pelias/placeholder

**/

/**
  NullTransport

  disables the service completely
**/
function NullTransport(){}
NullTransport.prototype.query = function( ids, cb ){
  cb(); // no-op
};

/**
  HttpTransport

  allows the api to be used via a remote web service
**/
function HttpTransport( host, settings ){
  this.query = function( ids, cb ){
    request
      .get( host + '/parser/findbyid' )
      .set( 'Accept', 'application/json' )
      .query({ ids: Array.isArray( ids ) ? ids.join(',') : '' })
      .timeout( settings && settings.timeout || 1000 )
      .end( function( err, res ){
        if( err || !res ){ return cb( err ); }
        if( 200 !== res.status ){ return cb( 'non 200 status' ); }
        return cb( null, res.body );
      });
  };
}
HttpTransport.prototype.query = function( coord, number, street, cb ){
  throw new Error( 'language: transport not connected' );
};

/**
  Setup

  allows instantiation of transport depending on configuration and preference
**/
module.exports.findById = function setup(){

  // user config
  var config = peliasConfig.generate();

  // ensure config variables set correctly
  if( !config.hasOwnProperty('language') || !config.language.hasOwnProperty('client') ){
    logger.warn( 'language: configuration not found' );
  }

  // valid configuration found
  else {

    // get adapter settings from config
    var settings = config.language.client;

    // http adapter
    if( 'http' === settings.adapter && settings.hasOwnProperty('host') ){
      logger.info( 'language: using http transport:', settings.host );
      if( settings.hasOwnProperty('timeout') ){
        return new HttpTransport( settings.host, { timeout: parseInt( settings.timeout, 10 ) } );
      }
      return new HttpTransport( settings.host );
    }
  }

  // default adapter
  logger.info( 'language: using null transport' );
  return new NullTransport();
};
