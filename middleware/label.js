var _ = require('lodash');
var labelGenerator = require('../helper/labelGenerator');

function setup() {
  return addLabels;
}

function addLabels(req, res, next) {
  // do nothing if no result data set
  if (!res || !res.data) {
    return next();
  }

  var lang;
  if (req.clean) {
    lang = req.clean.lang;
  }
  lang = lang || 'default';

  res.data.map(function addLabel(place) {
    place.label = labelGenerator(place);
  });

  // then check duplicates and add details until all unique

  next();
}

module.exports = setup;
