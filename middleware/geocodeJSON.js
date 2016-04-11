var url = require('url');
var extend = require('extend');
var geojsonify = require('../helper/geojsonify').search;
var logger = require('pelias-logger').get('api:middleware:geocodeJSON');

/**
 * Returns a middleware function that converts elasticsearch
 * results into geocodeJSON format.
 *
 * @param {object} [peliasConfig] api portion of pelias config
 * @param {string} [basePath]
 * @returns {middleware}
 */
function setup(peliasConfig, basePath) {

  var opts = {
    config: peliasConfig || require('pelias-config').generate().api,
    basePath: basePath || '/'
  };
  function middleware(req, res, next) {
    return convertToGeocodeJSON(req, res, next, opts);
  }

  return middleware;
}

/**
 * Converts elasticsearch results into geocodeJSON format
 *
 * @param {object} req
 * @param {object} res
 * @param {object} next
 * @param {object} opts
 * @param {string} opts.basePath e.g. '/v1/'
 * @param {string} opts.config.host e.g. 'pelias.mapzen.com'
 * @param {string} opts.config.version e.g. 1.0
 * @returns {*}
 */
function convertToGeocodeJSON(req, res, next, opts) {

  res.body = { geocoding: {} };

  // REQUIRED. A semver.org compliant version number. Describes the version of
  // the GeocodeJSON spec that is implemented by this instance.
  res.body.geocoding.version = '0.1';

  // OPTIONAL. Default: null. The attribution of the data. In case of multiple sources,
  // and then multiple attributions, can be an object with one key by source.
  // Can be a URI on the server, which outlines attribution details.
  res.body.geocoding.attribution = url.resolve(opts.config.host, opts.basePath + 'attribution');

  // OPTIONAL. Default: null. The query that has been issued to trigger the
  // search.
  // Freeform object.
  // This is the equivalent of how the engine interpreted the incoming request.
  // Helpful for debugging and understanding how the input impacts results.
  res.body.geocoding.query = req.clean;

  // OPTIONAL. Warnings and errors.
  addMessages(req, 'warnings', res.body.geocoding);
  addMessages(req, 'errors', res.body.geocoding);

  // OPTIONAL
  // Freeform
  addEngine(opts.config.version, res.body.geocoding);

  // response envelope
  res.body.geocoding.timestamp = new Date().getTime();

  var lang = req.lang;
  if (!lang) {
    var languages = opts.config.languages;
    if (languages && languages.length>0) {
      lang = languages[0];
    }
  }
  lang = lang || 'default'; // fallback

  // convert docs to geojson and merge with geocoding block
  extend(res.body, geojsonify(res.data || [], lang));

  next();
}

function addMessages(req, msgType, geocoding) {
  if (req.hasOwnProperty(msgType) && req[msgType].length) {
    geocoding[msgType] = req[msgType];
  }
}

function addEngine(version, geocoding) {
  geocoding.engine = {
    name: 'Pelias',
    author: 'Mapzen',
    version: version
  };
}

module.exports = setup;
