
var GeoJSON = require('geojson');
var extent = require('geojson-extent');
var outputGenerator = require('./outputGenerator');
var logger = require('pelias-logger').get('api');


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


var SOURCES = {
  'geoname': 'gn',
  'osmnode': 'osm',
  'osmway': 'osm',
  'admin0': 'qs',
  'admin1': 'qs',
  'admin2': 'qs',
  'neighborhood': 'qs',
  'locality': 'qs',
  'local_admin': 'qs',
  'osmaddress': 'osm',
  'openaddresses': 'oa'
};

function lookupSource(src) {
  return SOURCES.hasOwnProperty(src._type) ? SOURCES[src._type] : src._type;
}

function lookupLayer(src) {
  switch(src._type) {
    case 'osmnode':
    case 'osmway':
      return 'venue';
    case 'admin0':
      return 'country';
    case 'admin1':
      return 'region';
    case 'admin2':
      return 'county';
    case 'neighborhood':
      return 'neighbourhood';
    case 'locality':
      return 'locality';
    case 'local_admin':
      return 'localadmin';
    case 'osmaddress':
    case 'openaddresses':
      return 'address';
    case 'geoname':
      if (src.category && src.category.indexOf('admin') !== -1) {
        if (src.category.indexOf('admin:city') !== -1) { return 'locality'; }
        if (src.category.indexOf('admin:admin1') !== -1) { return 'region'; }
        if (src.category.indexOf('admin:admin2') !== -1) { return 'county'; }
        return 'neighbourhood'; // this could also be 'local_admin'
      }

      if (src.name) { return 'venue'; }
      if (src.address) { return 'address'; }
  }

  logger.warn('[geojsonify]: could not map _type ', src._type);

  return src._type;
}

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
  dst.id = src._id;
  dst.layer = lookupLayer(src);
  dst.source = lookupSource(src);
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