const GeoJSON = require('geojson');
const extent = require('@mapbox/geojson-extent');
const logger = require('pelias-logger').get('geojsonify');
const collectDetails = require('./geojsonify_place_details');
const _ = require('lodash');
const Document = require('pelias-model').Document;

function geojsonifyPlaces(params, docs, geometriesParam){
  var geometries = [];
  //Gather query param
  if(geometriesParam){
    geometries = geometriesParam.split(',');
  }
  // Weed out non-geo data.
  const geodata = docs
    .filter(doc => {
      if (!_.has(doc, 'center_point')) {
        logger.warn('No doc or center_point property');
        return false;
      } else {
        return true;
      }
    }).map(geojsonifyPlace.bind(null, params));

  //Check for polygon data
  var polygonData = [];
  var pointData = [];
  _.forEach(docs, doc => {

    if(_.has(doc, 'polygon')){
      polygonData.push(doc);

    }
    else{
      pointData.push(doc);

    }
  });
  polygonData = polygonData.map(geojsonifyPlace.bind(null, params));
  pointData = pointData.map(geojsonifyPlace.bind(null, params));
  console.log(JSON.stringify(polygonData));
  //Schemas for geojson parsing library
  const pointSchema = { Point: ['lat', 'lng'] };
  const polygonSchema = { Polygon: 'polygon' };
  //Interpret point features as points no matter what
  var pointGeojson = GeoJSON.parse( pointData, pointSchema);
  var polygonGeojson;
  //Determine whether to treat polygons as polygons or centerpoints
  var selectedSchema;

  if(_.indexOf(geometries, 'polygon') > -1){
    polygonGeojson = GeoJSON.parse(polygonData, polygonSchema);
  }
  else{
    polygonGeojson = GeoJSON.parse(polygonData, pointSchema);
  }
  //Parse and concatenate accordingly

  pointGeojson.features = (polygonGeojson.features).concat(pointGeojson.features);
  
  // get all the bounding_box corners as well as single points
  // to be used for computing the overall bounding_box for the FeatureCollection
  const extentPoints = extractExtentPoints(geodata);
  const geojsonExtentPoints = GeoJSON.parse( extentPoints, { Point: ['lat', 'lng'] });
  
  // to insert the bbox property at the top level of each feature, it must be done separately after
  // initial geojson construction is finished
  addBBoxPerFeature(pointGeojson);

  // bounding box calculations
  computeBBox(pointGeojson, geojsonExtentPoints);

  return pointGeojson;
}

function geojsonifyPlace(params, place) {
  // setup the base doc
  const doc = {
    id: place._id,
    gid: new Document(place.source, place.layer, place._id).getGid(),
    layer: place.layer,
    source: place.source,
    source_id: place.source_id,
    bounding_box: place.bounding_box,
    lat: parseFloat(place.center_point.lat),
    lng: parseFloat(place.center_point.lon),
  };
  // assign name, logging a warning if it doesn't exist
  if (_.has(place, 'name.default')) {
    doc.name = place.name.default;
  } else {
    logger.warn(`doc ${doc.gid} does not contain name.default`);
  }
  if (_.has(place, 'polygon')) {
    doc.polygon = place.polygon;
  }

  // assign all the details info into the doc
  Object.assign(doc, collectDetails(params, place));

  return doc;
}

/**
 * Add bounding box
 *
 * @param {object} geojson
 */
function addBBoxPerFeature(geojson) {
  geojson.features.forEach(feature => {
    if (feature.properties.bounding_box) {
      feature.bbox = [
        feature.properties.bounding_box.min_lon,
        feature.properties.bounding_box.min_lat,
        feature.properties.bounding_box.max_lon,
        feature.properties.bounding_box.max_lat
      ];
    }

    delete feature.properties.bounding_box;
  });
}

/**
 * Collect all points from the geodata.
 * If an item is a single point, just use that.
 * If an item has a bounding box, add two corners of the box as individual points.
 *
 * @param {Array} geodata
 * @returns {Array}
 */
function extractExtentPoints(geodata) {
  return geodata.reduce((extentPoints, place) => {
    // if there's a bounding_box, use the LL/UR for the extent
    if (place.bounding_box) {
      extentPoints.push({
        lng: place.bounding_box.min_lon,
        lat: place.bounding_box.min_lat
      });
      extentPoints.push({
        lng: place.bounding_box.max_lon,
        lat: place.bounding_box.max_lat
      });

    }
    else {
      // otherwise, use the point for the extent
      extentPoints.push({
        lng: place.lng,
        lat: place.lat
      });

    }
    return extentPoints;

  }, []);

}

/**
 * Compute bbox that encompasses all features in the result set.
 * Set bbox property on the geojson object.
 *
 * @param {object} geojson
 */
function computeBBox(geojson, geojsonExtentPoints) {
  // @note: extent() sometimes throws Errors for unusual data
  // eg: https://github.com/pelias/pelias/issues/84
  try {
    var bbox = extent( geojsonExtentPoints );
    if( !!bbox ){
      geojson.bbox = bbox;
    }
  } catch( e ){
    console.error( 'bbox error', e.message, e.stack );
    console.error( 'geojson', JSON.stringify( geojsonExtentPoints, null, 2 ) );
  }
}

module.exports = geojsonifyPlaces;
