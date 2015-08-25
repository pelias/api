
var GeoJSON = require('geojson'),
    extend = require('extend'),
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
    if( !doc || !doc.hasOwnProperty( 'center_point' ) ) {
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

  var geojson = buildGeocodingBlock();
  // convert to geojson and merge with geocoding block
  // (geocoding block is first so it shows up on top)
  extend(geojson, GeoJSON.parse( geodata, { Point: ['lat', 'lng'] }));

  // bounding box calculations
  // @note: extent() sometimes throws Errors for unusual data
  // eg: https://github.com/pelias/pelias/issues/84
  try {
    var bbox = extent( geojson );
    if( !!bbox ){
      geojson.bbox = bbox;
    }
  } catch( e ){
    console.error( 'bbox error', e.message, e.stack );
    console.error( 'geojson', JSON.stringify( geojson, null, 2 ) );
  }

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

/**
 * Build geocoding block with version info and deprecation warning
 *
 * @return {object}
 */
function buildGeocodingBlock() {
  var geocoding = {};

  geocoding.version = 'BETA';
  geocoding.messages = {
    warn: [
      'Pelias v1.0 will be released in September 2015!!!',
      'Starting September 1st, all users must obtain FREE developer keys in order to continue using this service.',
      'There will be breaking changes to the API, so action must be taken to upgrade client code.',
      'Backwards compatibility will be maintained through November, followed by deprecation and shut-off of previous version.'
    ]
  };

  return { geocoding: geocoding };
}

module.exports.search = search;