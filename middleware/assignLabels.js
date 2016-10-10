function setup(labelGenerator) {
  function middleware(req, res, next) {
    return assignLabel(req, res, next, labelGenerator || require('pelias-labels'));
  }

  return middleware;
}

function assignLabel(req, res, next, labelGenerator) {

  // do nothing if there's nothing to process
  if (!res || !res.data) {
    return next();
  }

  res.data.forEach(function (result) {
    result.label = labelGenerator(result.parent);
  });

  next();
}

module.exports = setup;
