var defaultLabelGenerator = require('pelias-labels');

function setup(labelGenerator) {
  function middleware(req, res, next) {
    return assignLabel(req, res, next, labelGenerator || defaultLabelGenerator);
  }

  return middleware;
}

function assignLabel(req, res, next, labelGenerator) {

  // do nothing if there's nothing to process
  if (!res || !res.data) {
    return next();
  }

  res.data.forEach(function (result) {
      result.label = labelGenerator(result);
      // Entur - override default behaviour in pelias-labels deduping ', locality' part
      // when locality = name. Instead adding county name in ( )
      if (result.locality && result.county && result.name && result.name.default && !result.label.includes(',')) {
        result.label = result.name.default + ' (' + result.county + ')';
      }
  });

  next();
}

module.exports = setup;
