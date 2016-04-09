var url = require('url');
var extend = require('extend');
var geojsonify = require('../helper/geojsonify').search;
var iterate = require('../helper/iterate');

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

  var timestamp = new Date().getTime();

  res.body = [];

  iterate(req.clean, res.results, function(clean, result, index) {

    var geocoding = {};

    // REQUIRED. A semver.org compliant version number. Describes the version of
    // the GeocodeJSON spec that is implemented by this instance.
    geocoding.version = '0.1';

    // OPTIONAL. Default: null. The attribution of the data. In case of multiple sources,
    // and then multiple attributions, can be an object with one key by source.
    // Can be a URI on the server, which outlines attribution details.
    geocoding.attribution = url.resolve(opts.config.host, opts.basePath + 'attribution');

    // OPTIONAL. Default: null. The query that has been issued to trigger the
    // search.
    // Freeform object.
    // This is the equivalent of how the engine interpreted the incoming request.
    // Helpful for debugging and understanding how the input impacts results.
    geocoding.query = clean;

    // OPTIONAL. Warnings and errors.
    addMessages(req, 'warnings', index, geocoding);
    addMessages(req, 'errors', index, geocoding);

    // OPTIONAL
    // Freeform
    addEngine(opts.config.version, geocoding);

    // response envelope
    geocoding.timestamp = timestamp;

    // convert docs to geojson and merge with geocoding block
    var body = { geocoding: geocoding };
    extend(body, geojsonify((result && result.data) || []));

    res.body.push(body);
  });

  next();
}

function addMessages(req, msgType, index, geocoding) {
  if (req.hasOwnProperty(msgType) && req[msgType][index] && req[msgType][index].length) {
    geocoding[msgType] = req[msgType][index];
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
