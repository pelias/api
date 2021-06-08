const defaultLabelGenerator = require('pelias-labels').partsGenerator;
const _ = require('lodash');

function setup(labelGenerator) {
  function middleware(req, res, next) {
    return assignLabel(req, res, next, labelGenerator || defaultLabelGenerator);
  }

  return middleware;
}

function getLabelFromLayer(parts, layer) {
  const part = parts.find(p => p.layer === layer);
  return _.get(part, 'label');
}

function filterUnambiguousParts(part, second) {
  if (part.role === 'required') {
    return false;
  }
  const label = getLabelFromLayer(second.parts, part.layer);
  return label && label !== part.label;
}

function getBestLayers(results) {
  const first = results[0];
  const second = results[1];
  return first.parts.filter(p => filterUnambiguousParts(p, second)).map(p => p.layer);
}

function assignLabel(req, res, next, labelGenerator) {

  // do nothing if there's nothing to process
  if (!res || !res.data) {
    return next();
  }

  // This object will help for label deduplication
  const dedupLabel = {};

  // First we assign for all result the default label with all required layers
  res.data.forEach(function (result) {
    const { parts, separator } = labelGenerator(result);
    result.label = parts.filter(e => e.role === 'required').map(e => e.label).join(separator);
    dedupLabel[result.label] = dedupLabel[result.label] || [];
    dedupLabel[result.label].push({ result, parts, separator });
  });

  // We check all values with more than one entry
  Object.values(dedupLabel)
    .filter(results => results.length > 1)
    .forEach(results => {
      // This array will contain all optional layers that should be displayed
      const bestLayers = getBestLayers(results);
      // We reassign the label with the new value
      results.forEach(({ result, parts, separator }) => {
        result.label = parts.filter(e => e.role === 'required' || bestLayers.indexOf(e.layer) >= 0).map(e => e.label).join(separator);
      });
    });

  next();
}

module.exports = setup;
