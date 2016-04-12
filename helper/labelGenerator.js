var _ = require('lodash'),
    schemas = require('./labelSchema');

module.exports = function( record ){
  var schema = getSchema(record.country_a);

  // in virtually all cases, this will be the `name` field
  var labelParts = getInitialLabel(record);

  // iterate the schema
  for (var field in schema) {
    var valueFunction = schema[field];
    labelParts.push(valueFunction(record));
  }

  // retain only things that are defined
  labelParts = labelParts.filter(function(v) { return !_.isUndefined(v); });

  // first, dedupe the name and 1st label array elements
  //  this is used to ensure that the `name` and first admin hierarchy elements aren't repeated
  //  eg - `["Lancaster", "Lancaster", "PA", "United States"]` -> `["Lancaster", "PA", "United States"]`
  var dedupedNameAndFirstLabelElement = _.uniq([labelParts.shift(), labelParts.shift()]);

  // second, unshift the deduped parts back onto the labelParts
  labelParts.unshift.apply(labelParts, dedupedNameAndFirstLabelElement);

  // third, join with a comma and return
  return labelParts.join(', ');

};

function getSchema(country_a) {
  if (country_a && country_a.length && schemas[country_a]) {
    return schemas[country_a];
  }

  return schemas.default;

}

// helper function that sets a default label for non-US/CA regions
// this is a very special case
function getInitialLabel(record) {
  if (isRegion(record.layer) &&
      isGeonamesOrWhosOnFirst(record.source) &&
      isUSAOrCAN(record.country_a)) {
    return [];
  }

  return [record.name];

}

function isRegion(layer) {
  return 'region' === layer;
}

function isUSAOrCAN(country_a) {
  return 'USA' === country_a || 'CAN' === country_a;
}

function isGeonamesOrWhosOnFirst(source) {
  return 'geonames' === source || 'whosonfirst' === source;

}
