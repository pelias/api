
var GeoJSON = require('geojson'),
    outputGenerator = require('./outputGenerator');

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

    // generate region-specific text string
    output.text = outputGenerator( doc );

    return output;

  // filter-out invalid entries
  }).filter( function( doc ){
    return doc;
  });

  // convert to geojson
  return GeoJSON.parse( geodata, { Point: ['lat', 'lng'] } );

}

module.exports.search = search;