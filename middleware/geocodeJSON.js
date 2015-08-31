var extend = require('extend');
var geojsonify = require('../helper/geojsonify').search;

function setup(peliasConfig) {

  peliasConfig = peliasConfig || require( 'pelias-config' ).generate().api;
  
  function middleware(req, res, next) {
    return convertToGeocodeJSON(peliasConfig, req, next);
  }

  return middleware;
}

function convertToGeocodeJSON(peliasConfig, req, next) {

  req.results.geojson = { geocoding: {} };

  // REQUIRED. A semver.org compliant version number. Describes the version of
  // the GeocodeJSON spec that is implemented by this instance.
  req.results.geojson.geocoding.version = '0.1';

  // OPTIONAL. Default: null. The licence of the data. In case of multiple sources,
  // and then multiple licences, can be an object with one key by source.
  // Can be a freeform text property describing the licensing details.
  // Can be a URI on the server, which outlines licensing details.
  req.results.geojson.geocoding.license = peliasConfig.host + '/license'; // TODO: add to config

  // OPTIONAL. Default: null. The attribution of the data. In case of multiple sources,
  // and then multiple attributions, can be an object with one key by source.
  // Can be a URI on the server, which outlines attribution details.
  req.results.geojson.geocoding.attribution = peliasConfig.host + '/attribution'; // TODO: add to config

  // OPTIONAL. Default: null. The query that has been issued to trigger the
  // search.
  // Freeform object.
  // This is the equivalent of how the engine interpreted the incoming request.
  // Helpful for debugging and understanding how the input impacts results.
  req.results.geojson.geocoding.query = req.clean;

  // OPTIONAL. Warnings and errors.
  addMessages(req.results, 'warnings', req.results.geojson.geocoding);
  addMessages(req.results, 'errors', req.results.geojson.geocoding);

  // OPTIONAL
  // Freeform
  addEngine(peliasConfig, req.results.geojson.geocoding);

  // response envelope
  req.results.geojson.geocoding.timestamp = new Date().getTime();

  // convert docs to geojson and merge with geocoding block
  extend(req.results.geojson, geojsonify(req.results.data, req.clean));

  next();
}

function addMessages(results, msgType, geocoding) {
  if (results.hasOwnProperty(msgType)) {
    geocoding.messages = geocoding.messages || {};
    geocoding.messages[msgType] = results[msgType];
  }
}

function addEngine(peliasConfig, geocoding) {
  geocoding.engine = {
    name: 'Pelias',
    author: 'Mapzen',
    version: peliasConfig.version // TODO: add to config
  };
}

module.exports = setup;
