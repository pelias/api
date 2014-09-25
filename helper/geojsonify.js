
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

module.exports.suggest = suggest;