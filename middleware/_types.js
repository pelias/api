/**
 * Take the layers specified by the layers parameter and use them to set the
 * list of Elasticsearch types to filter.
 *
 * This has to be done outside the layers sanitizer since it doesn't know that
 * the layers property is eventualy used to choose the _type.
 */
function middleware(req, res, next) {
  req.clean = req.clean || {};

  if (req.clean.hasOwnProperty('layers')) {
    req.clean.type = req.clean.layers;
  }

  next();
}

module.exports = middleware;
