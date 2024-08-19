const _ = require('lodash');

const defaultLabelGenerator = require('pelias-labels').partsGenerator;

function setup(labelGenerator) {
  function middleware(req, res, next) {
    return assignLabel(req, res, next, labelGenerator || defaultLabelGenerator);
  }

  return middleware;
}

function getLabelFromLayer(labelParts, layer) {
  const part = labelParts.find(p => p.layer === layer);
  return _.get(part, 'label');
}

function filterUnambiguousParts(second) {
  return (labelParts) => {
    if (labelParts.role === 'required') {
      return false;
    }
    const label = getLabelFromLayer(second.labelParts, labelParts.layer);
    return label && label !== labelParts.label;  
  };
}

function getBestLayers(results) {
  const bestLayers = new Set();
  const first = results[0];
  // Ensure deduplication based on optional elements even when the first two elements are equals.
  for (let i = 1; i < results.length; i++) {
    const second = results[i];
    first.labelParts.filter(filterUnambiguousParts(second)).map((p) => bestLayers.add(p.layer));
    if (bestLayers.size > 0) {
      // For now, we break as soon as we find a discriminant.
      break;
    }
  }
  return bestLayers;
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
    const { labelParts, separator } = labelGenerator(result, _.get(req, 'clean.lang.iso6393'));
    result.label = labelParts.filter(e => e.role === 'required').map(e => e.label).join(separator);
    dedupLabel[result.label] = dedupLabel[result.label] || [];
    dedupLabel[result.label].push({ result, labelParts, separator });
  });

  // We check all values with more than one entry
  Object.values(dedupLabel)
    .filter(results => results.length > 1)
    .forEach(results => {
      // This array will contain all optional layers that should be displayed
      const bestLayers = getBestLayers(results);
      // We reassign the label with the new value
      results.forEach(({ result, labelParts, separator }) => {
        result.label = labelParts.filter(e => e.role === 'required' || bestLayers.has(e.layer)).map(e => e.label).join(separator);
      });
    });

  next();
}

module.exports = setup;
