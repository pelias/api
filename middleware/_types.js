/**
 * Take the layers specified by the layers parameter and use them to set the
 * list of Elasticsearch types to filter.
 *
 * Elasticsearch interprets an empty array of types as "search anything" rather
 * than "search nothing", so in the case of an empty array, return an error
 * message instead of searching at all.
 */
function middleware(req, res, next) {
  req.clean = req.clean || {};

  if (req.clean.hasOwnProperty('layers')) {
    req.clean.type = req.clean.layers;
  }

  next();
}

module.exports = middleware;
