
var async = require('async');
var logger = require( 'pelias-logger' ).get( 'api' );
var service = require('../service/interpolation');

/**
example response from interpolation web service:
{
  type: 'Feature',
  properties: {
    type: 'interpolated',
    source: 'mixed',
    number: '17',
    lat: -41.2887032,
    lon: 174.767089
  },
  geometry: {
    type: 'Point',
    coordinates: [ 174.767089, -41.2887032 ]
  }
}
**/

function setup() {

  var transport = service.search();
  var middleware = function(req, res, next) {

    // no-op, user did not request an address
    if( !isAddressQuery( req ) ){
      return next();
    }

    // bind parsed_text variables to function call
    var bound = interpolate.bind( transport, req.clean.parsed_text );

    // perform interpolations asynchronously for all relevant hits
    var timer = (new Date()).getTime();
    async.map( res.data, bound, function( err, results ){

      // update res.data with the mapped values
      if( !err ){
        res.data = results;
      }

      // log the execution time, continue
      logger.info( '[interpolation] [took]', (new Date()).getTime() - timer, 'ms' );
      next();
    });
  };

  middleware.transport = transport;
  return middleware;
}

function interpolate( parsed_text, hit, cb ){

  // no-op, this hit is not from the 'street' layer
  // note: no network request is performed.
  if( !hit || hit.layer !== 'street' ){
    return cb( null, hit );
  }

  // query variables
  var coord = hit.center_point;
  var number = parsed_text.number;
  var street = hit.address_parts.street || parsed_text.street;

  // query interpolation service
  this.query( coord, number, street, function( err, data ){

    // an error occurred
    // note: leave this hit unmodified
    if( err ){
      logger.error( '[interpolation] [error]', err );
      return cb( null, hit );
    }

    // invalid / not useful response
    // note: leave this hit unmodified
    if( !data || !data.hasOwnProperty('properties') ){
      logger.info( '[interpolation] [miss]', parsed_text );
      return cb( null, hit );
    }

    // the interpolation service returned a valid result
    // note: we now merge thos values with the existing 'street' record.
    logger.info( '[interpolation] [hit]', parsed_text, data );

    // safety first!
    try {

      // -- metatdata --
      hit.layer = 'address';
      hit.match_type = 'interpolated';

      // -- name --
      hit.name.default = data.properties.number + ' ' + hit.name.default;

      // -- source --
      var source = 'mixed';
      if( data.properties.source === 'OSM' ){ source = 'openstreetmap'; }
      else if( data.properties.source === 'OA' ){ source = 'openaddresses'; }
      hit.source = source;

      // -- source_id --
      // note: interpolated values have no source_id
      delete hit.source_id; // remove original street source_id
      if( data.properties.hasOwnProperty( 'source_id' ) ){
        hit.source_id = data.properties.source_id;
      }

      // -- address_parts --
      hit.address_parts.number = data.properties.number;

      // -- geo --
      hit.center_point = {
        lat: data.properties.lat,
        lon: data.properties.lon
      };

      // -- bbox --
      delete hit.bounding_box;

      // return the modified hit
      return cb( null, hit );

    // a syntax error occurred in the code above (this shouldn't happen!)
    // note: the hit object may be partially modified, could possibly be invalid
    } catch( e ){
      logger.error( '[interpolation] [error]', e, e.stack );
      return cb( null, hit );
    }
  });
}

// boolean function to check if an address was requested by the user
function isAddressQuery( req ){
  return req && req.hasOwnProperty('clean') &&
         req.clean.hasOwnProperty('parsed_text') &&
         req.clean.parsed_text.hasOwnProperty('number') &&
         req.clean.parsed_text.hasOwnProperty('street');
}

module.exports = setup;
