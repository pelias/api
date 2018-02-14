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
      // Entur: Use display name as default name when set. To display alias documents by their proper name
      if (result && result.alias && result.alias !== result.name.default) {
          var resCopy = result.copy();
          resCopy.name.default = result.name.display;
          result.label = labelGenerator(resCopy);
      } else {
          result.label = labelGenerator(result);
      }
  });

  next();
}

module.exports = setup;
