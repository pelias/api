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

  // retain only things that are truthy
  labelParts = _.compact(labelParts);

  // third, dedupe and join with a comma and return
  return dedupeNameAndFirstLabelElement(labelParts).join(', ');

};

function dedupeNameAndFirstLabelElement(labelParts) {
  // only dedupe if a result has more than a name (the first label part)
  if (labelParts.length > 1) {
    // first, dedupe the name and 1st label array elements
    //  this is used to ensure that the `name` and first admin hierarchy elements aren't repeated
    //  eg - `["Lancaster", "Lancaster", "PA", "United States"]` -> `["Lancaster", "PA", "United States"]`
    var deduped = _.uniq([labelParts.shift(), labelParts.shift()]);

    // second, unshift the deduped parts back onto the labelParts
    labelParts.unshift.apply(labelParts, deduped);

  }

  return labelParts;

}

function getSchema(country_a) {
  if (country_a && country_a.length && schemas[country_a]) {
    return schemas[country_a];
  }

  return schemas.default;

}

// helper function that sets a default label for non-US/CA regions and countries
function getInitialLabel(record) {
  if (isRegion(record.layer) &&
      isGeonamesOrWhosOnFirst(record.source) &&
      isUSAOrCAN(record.country_a)) {
    return [];
  }

  if (isCountry(record.layer)) {
    return [];
  }

  return [record.name];

}

// this can go away once geonames is no longer supported
// https://github.com/pelias/wof-admin-lookup/issues/49
function isCountry(layer) {
  return 'country' === layer;
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
