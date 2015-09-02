
var GeoJSON = require('geojson'),
    extent = require('geojson-extent'),
    outputGenerator = require('./outputGenerator');

// Properties to be copied when details=true
var DETAILS_PROPS = [
  'housenumber',
  'street',
  'category',
  'postalcode',
  'country_a',
  'country',
  'region',
  'region_a',
  'county',
  'localadmin',
  'locality',
  'neighbourhood'
];

var META_MAP = {
  'geoname': { type: '???', source: 'gn' }, // TODO: not sure how to map. will need to use categories?
  'osmnode': { type: 'venue', source: 'osm' },
  'osmway': { type: 'venue', source: 'osm' },
  'admin0': { type: 'country', source: 'qs' },
  'admin1': { type: 'region', source: 'qs' },
  'admin2': { type: 'county', source: 'qs' },
  'neighborhood': { type: 'neighbourhood', source: 'qs' },
  'locality': { type: 'locality', source: 'qs' },
  'local_admin': { type: 'local_admin', source: 'qs' },
  'osmaddress': { type: 'address', source: 'osm' },
  'openaddresses': { type: 'address', source: 'oa' }
};

function geojsonifyPlaces( docs, params ){

  var details = params ? params.details : {};
  details = details === true || details === 1;

  // flatten & expand data for geojson conversion
  var geodata = docs
    .map(geojsonifyPlace.bind(null, details))
    .filter( function( doc ){
      return !!doc;
    });

  // convert to geojson
  var geojson = GeoJSON.parse( geodata, { Point: ['lat', 'lng'] });

  // bounding box calculations
  computeBBox(geojson);

  return geojson;
}

function geojsonifyPlace(details, place) {

  // something went very wrong
  if( !place || !place.hasOwnProperty( 'center_point' ) ) {
    return warning('No doc or center_point property');
  }

  var geocoding = {};

  addMetaData(place, geocoding);
  addDetails(details, place, geocoding);
  addLabel(place, geocoding);

  var output = {};

  output.geocoding = geocoding;
  // map center_point for GeoJSON to work properly
  // these should not show up in the final feature properties
  output.lat = parseFloat(place.center_point.lat);
  output.lng = parseFloat(place.center_point.lon);

  return output;
}

/**
 * Add details properties when needed
 *
 * @param {boolean} details
 * @param {object} src
 * @param {object} dst
 */
function addDetails(details, src, dst) {
  if (details) {
    // map name
    if( !src.name || !src.name.default ) { return warning(src); }
    dst.name = src.name.default;

    copyProperties(src, DETAILS_PROPS, dst);
  }
}

/**
 * Add region-specific label string
 *
 * @param {object} src
 * @param {object} dst
 */
function addLabel(src, dst) {
  dst.label = outputGenerator(src);
}

/**
 * Compute bbox that encompasses all features in the result set.
 * Set bbox property on the geojson object.
 *
 * @param {object} geojson
 */
function computeBBox(geojson) {
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
}

/**
 * Copy specified properties from source to dest.
 * Ignore missing properties.
 *
 * @param {object} source
 * @param {[]} props
 * @param {object} dst
 */
function copyProperties( source, props, dst ) {
  props.forEach( function ( prop ) {
    if ( source.hasOwnProperty( prop ) ) {
      dst[prop] = source[prop];
    }
  });
}

/**
 * Determine and set place id, type, and source
 *
 * @param {object} src
 * @param {object} dst
 */
function addMetaData(src, dst) {
  // lookup mapping, or set both values to _type if not found
  var meta = META_MAP[src._type] || { type: src._type, source: src._type };

  dst.id = src._id;
  dst.layer = meta.type;
  dst.source = meta.source;
}

/**
 * emit a warning if the doc format is invalid
 *
 * @note: if you see this error, fix it ASAP!
 */
function warning( doc ) {
  console.error( 'error: invalid doc', __filename, doc);
  return false; // remove offending doc from results
}


module.exports.search = geojsonifyPlaces;