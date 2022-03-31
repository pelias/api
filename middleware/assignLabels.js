const _ = require('lodash');

const defaultLabelGenerator = require('pelias-labels');

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
    result.label = labelGenerator(result, _.get(req, 'clean.lang.iso6393'));
  });

  next();
}

module.exports = setup;
