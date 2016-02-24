
var _ = require('lodash'),
    check = require('check-types'),
    schemas = require('./labelSchema.json');

module.exports = function( record ){

  var labelParts = [ record.name.default ];

  var schema = getSchema(record.country_a);

  var buildOutput = function(parts, schemaArr, record) {
    for (var i=0; i<schemaArr.length; i++) {
      var fieldValue = record[schemaArr[i]];
      if (check.unemptyString(fieldValue) && !_.contains(parts, fieldValue)) {
        parts.push( fieldValue );
        return parts;
      }
    }
    return parts;
  };

  for (var key in schema) {
    labelParts = buildOutput(labelParts, schema[key], record);
  }

  // de-dupe outputs
  labelParts = _.unique( labelParts );

  return labelParts.join(', ').trim();
};

// helper method that determines which schema to use based on country alpha3
function getSchema(country_a) {
  if (country_a && country_a.length && schemas[country_a]) {
    return schemas[country_a];
  }

  return schemas.default;
}
