
var GeoJSON = require('geojson');

function suggest( docs ){

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
    doc.lat = parseFloat( geoParts[1] );
    doc.lng = parseFloat( geoParts[0] );

    // remove payload from doc
    delete doc.payload;
    return doc;

  // filter-out invalid entries
  }).filter( function( doc ){
    return doc;
  });

  // convert to geojson
  return GeoJSON.parse( geodata, { Point: ['lat', 'lng'] } );

}

function search( docs ){

  // emit a warning if the doc format is invalid
  // @note: if you see this error, fix it ASAP!
  function warning(){
    console.error( 'error: invalid doc', __filename );
    return false; // remove offending doc from results
  }

  // flatten & expand data for geojson conversion
  var geodata = docs.map( function( doc ){

    var output = {};

    // something went very wrong
    if( !doc ) return warning();

    // map center_point
    if( !doc.center_point ) return warning();
    output.lat = parseFloat( doc.center_point.lat );
    output.lng = parseFloat( doc.center_point.lon );

    // map name
    if( !doc.name || !doc.name.default ) return warning();
    output.name = doc.name.default;

    // map admin values
    if( doc.alpha3 ){ output.alpha3 = doc.alpha3; }
    if( doc.admin0 ){ output.admin0 = doc.admin0; }
    if( doc.admin1 ){ output.admin1 = doc.admin1; }
    if( doc.admin1_abbr ){ output.admin1_abbr = doc.admin1_abbr; }
    if( doc.admin2 ){ output.admin2 = doc.admin2; }
    if( doc.local_admin ){ output.local_admin = doc.local_admin; }
    if( doc.locality ){ output.locality = doc.locality; }
    if( doc.neighborhood ){ output.neighborhood = doc.neighborhood; }

    // map suggest output
    if( doc.suggest && doc.suggest.output ){
      output.text = doc.suggest.output;
    }

    return output;

  // filter-out invalid entries
  }).filter( function( doc ){
    return doc;
  });

  // convert to geojson
  return GeoJSON.parse( geodata, { Point: ['lat', 'lng'] } );

}

module.exports.suggest = suggest;
module.exports.search = search;