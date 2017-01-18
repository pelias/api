var _ = require('lodash'),
    schemas = require('./labelSchema');
var logger = require('pelias-logger').get('api:labelgenerator');

module.exports = function( record, req ){
  var schema = getSchema(record.country_a);

  // in virtually all cases, this will be the `name` field
  var labelParts = getInitialLabel(record);

  // iterate the schema
  for (var field in schema) {
    var valueFunction = schema[field];
    labelParts.push(valueFunction(record, req));
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
  if (!_.isEmpty(schemas[country_a])) {
    return schemas[country_a[0]];
  }

  return schemas.default;

}

// helper function that sets a default label
function getInitialLabel(record) {

  if (isCountry(record.layer)) {
    return [];
  }

  if (record.expandedName) {
    return [record.expandedName];
  }

  if (record.altName && record.altName !== record.name && record.name.indexOf(record.altName)===-1) {
    return [record.name +' ('+ record.altName +')'];
  }

  return [record.name];
}

// this can go away once geonames is no longer supported
// https://github.com/pelias/wof-admin-lookup/issues/49
function isCountry(layer) {
  return 'country' === layer;
}
