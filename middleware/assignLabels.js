function setup(labelGenerator) {
  function middleware(req, res, next) {
    return assignLabel(req, res, next, labelGenerator);
  }

  return middleware;
}

function assignLabel(req, res, next, labelGenerator) {

  // do nothing if there's nothing to process
  if (!res || !res.body || !res.body.features) {
    return next();
  }

  res.body.features.forEach(function (feature) {
    feature.properties.label = labelGenerator(feature.properties);
  });

  next();
}

module.exports = setup;
