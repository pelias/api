function sendJSONResponse(req, res) {
  // respond
  return res.status(200).json(req.results.geojson);
}

module.exports = sendJSONResponse;