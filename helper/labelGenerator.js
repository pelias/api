var _ = require('lodash'),
    schemas = require('./labelSchema');

module.exports = function( record ){
  var schema = getSchema(record.country_a);

  var labelParts = getInitialLabel(record);

  for (var key in schema) {
    var valueFunction = schema[key];

    labelParts = valueFunction(record, labelParts);
  }

  // NOTE: while it may seem odd to call `uniq` on the list of label parts,
  //  the effect is quite subtle.  Take, for instance, a result for "Lancaster, PA"
  //  the pseudo-object is:
  //  {
  //    'name': 'Lancaster',
  //    'locality': 'Lancaster',
  //    'region_a': 'PA',
  //    'country_a': 'USA'
  //  }
  //
  //  the code up to this point generates the label:
  //  `Lancaster, Lancaster, PA, USA`
  //
  //  then the `unique` call reduces this to:
  //  `Lancaster, PA, USA`
  //
  //  this code doesn't have the same effect in the case of a venue or address
  //  where the `name` field would contain the address or name of a point-of-interest
  //
  //  Also see https://github.com/pelias/api/issues/429 for other ways that this is bad
  //
  // de-dupe, join, trim
  return _.uniq( labelParts ).join(', ').trim();

};

function getSchema(country_a) {
  if (country_a && country_a.length && schemas[country_a]) {
    return schemas[country_a];
  }

  return schemas.default;

}

function getInitialLabel(record) {
  if ('region' === record.layer && ('geonames' === record.source || 'whosonfirst' === record.source)) {
    return [];
  }

  return [record.name.default];

}
