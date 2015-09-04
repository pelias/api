function sendJSONResponse(req, res, next) {

  // do nothing if no result data set
  if (!req.results || !req.results.geojson) {
    return next();
  }

  // respond
  return res.status(200).json(req.results.geojson);
}

module.exports = sendJSONResponse;