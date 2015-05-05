
var GeoJSON = require('geojson'),
    extent = require('geojson-extent'),
    outputGenerator = require('./outputGenerator');

// Properties to be copied when details=true
var DETAILS_PROPS = [
  'alpha3',
  'admin0',
  'admin1',
  'admin1_abbr',
  'admin2',
  'local_admin',
  'locality',
  'neighborhood',
  'category',
  'address'
];


function search( docs, params ){

  var details = params ? params.details : {};
  details = details === true || details === 1;

  // flatten & expand data for geojson conversion
  var geodata = docs.map( function( doc ) {

    // something went very wrong
    if( !doc || !doc.center_point ) {
      return warning();
    }

    var output = {};

    // provide metadata to consumer
    output.id = doc._id;
    output.layer = doc._type;

    // map center_point
    output.lat = parseFloat( doc.center_point.lat );
    output.lng = parseFloat( doc.center_point.lon );

    if (details) {
      // map name
      if( !doc.name || !doc.name.default ) { return warning(); }
      output.name = doc.name.default;

      copyProperties( doc, DETAILS_PROPS, output );
    }

    // generate region-specific text string
    output.text = outputGenerator( doc );

    return output;

  // filter-out invalid entries
  }).filter( function( doc ){
    return doc;
  });

  // convert to geojson
  var geojson = GeoJSON.parse( geodata, { Point: ['lat', 'lng'] });

  // add bbox
  geojson.bbox = extent( geojson ) || undefined;

  return geojson;
}

/**
 * Copy specified properties from source to dest.
 * Ignore missing properties.
 *
 * @param {object} source
 * @param {[]} props
 * @param {object} dest
 */
function copyProperties( source, props, dest ) {
  props.forEach( function ( prop ) {
    if ( source.hasOwnProperty( prop ) ) {
      dest[prop] = source[prop];
    }
  });
}


/**
 * emit a warning if the doc format is invalid
 *
 * @note: if you see this error, fix it ASAP!
 */
function warning( doc ) {
  console.error( 'error: invalid doc', __filename, doc );
  return false; // remove offending doc from results
}


module.exports.search = search;