
var GeoJSON = require('geojson');

function setup( backend, query ){

  // allow overriding of dependencies
  backend = backend || require('../src/backend');
  query = query || require('../query/suggest');

  function controller( req, res, next ){

    // backend command
    var cmd = {
      index: 'pelias',
      body: query( req.clean )
    };

    // query backend
    backend().client.suggest( cmd, function( err, data ){

      var docs = [];

      // handle backend errors
      if( err ){ return next( err ); }

      // map response to a valid FeatureCollection
      if( data && Array.isArray( data.pelias ) && data.pelias.length ){
        docs = data['pelias'][0].options || [];
      }

      // convert docs to geojson
      geoJsonifyDocs( docs, function( geojson ){

        // response envelope
        geojson.date = new Date().getTime();

        // respond
        return res.status(200).json( geojson );

      });
    });

  }

  return controller;
}

function geoJsonifyDocs( docs, cb ){

  // emit a warning if the doc format is invalid
  // @note: if you see this error, fix it ASAP!
  function warning(){
    console.error( 'error: invalid doc', __filename );
    return false; // remove offending doc from results
  }

  // flatten & expand data for geojson conversion
  var geodata = docs.map( function( doc ){

    // something went very wrong
    if( !doc || !doc.payload ) return warning();

    // split payload id string in to geojson properties
    if( 'string' !== typeof doc.payload.id ) return warning();
    var idParts = doc.payload.id.split('/');
    doc.type = idParts[0];
    doc.id = idParts[1];

    // split payload geo string in to geojson properties
    if( 'string' !== typeof doc.payload.geo ) return warning();
    var geoParts = doc.payload.geo.split(',');
    doc.lat = parseFloat( geoParts[0] );
    doc.lng = parseFloat( geoParts[1] );

    // remove payload from doc
    delete doc.payload;
    return doc;

  // filter-out invalid entries
  }).filter( function( doc ){
    return doc;
  });

  // convert to geojson
  GeoJSON.parse( geodata, { Point: ['lat', 'lng'] }, cb );
}

module.exports = setup;