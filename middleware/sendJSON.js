function sendJSONResponse(req, res, next) {

  // do nothing if no result data set
  if (!res || !res.body) {
    return next();
  }

  // respond
  return res.status(200).json(res.body);
}

module.exports = sendJSONResponse;