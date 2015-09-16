var extend = require('extend');
var geojsonify = require('../helper/geojsonify').search;

function setup(peliasConfig) {

  peliasConfig = peliasConfig || require( 'pelias-config' ).generate().api;
  
  function middleware(req, res, next) {
    return convertToGeocodeJSON(peliasConfig, req, res, next);
  }

  return middleware;
}

function convertToGeocodeJSON(peliasConfig, req, res, next) {

  // do nothing if no result data set
  if (!res || !res.data) {
    return next();
  }

  res.body = { geocoding: {} };

  // REQUIRED. A semver.org compliant version number. Describes the version of
  // the GeocodeJSON spec that is implemented by this instance.
  res.body.geocoding.version = '0.1';

  // OPTIONAL. Default: null. The attribution of the data. In case of multiple sources,
  // and then multiple attributions, can be an object with one key by source.
  // Can be a URI on the server, which outlines attribution details.
  res.body.geocoding.attribution = peliasConfig.host + 'attribution';

  // OPTIONAL. Default: null. The query that has been issued to trigger the
  // search.
  // Freeform object.
  // This is the equivalent of how the engine interpreted the incoming request.
  // Helpful for debugging and understanding how the input impacts results.
  res.body.geocoding.query = req.clean;

  // OPTIONAL. Warnings and errors.
  addMessages(res, 'warnings', res.body.geocoding);
  addMessages(res, 'errors', res.body.geocoding);

  // OPTIONAL
  // Freeform
  addEngine(peliasConfig, res.body.geocoding);

  // response envelope
  res.body.geocoding.timestamp = new Date().getTime();

  // convert docs to geojson and merge with geocoding block
  extend(res.body, geojsonify(res.data));

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
    version: peliasConfig.version
  };
}

module.exports = setup;
