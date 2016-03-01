
var _ = require('lodash'),
    check = require('check-types'),
    schemas = require('./labelSchema.json');

module.exports = function( record ){
  var schema = getSchema(record.country_a);

  var labelParts = [ record.name.default ];

  var buildOutput = function(parts, schemaArr, record) {
    for (var i=0; i<schemaArr.length; i++) {
      var fieldValue = record[schemaArr[i]];
      if (check.nonEmptyString(fieldValue) && !_.includes(parts, fieldValue)) {
        parts.push( fieldValue );
        return parts;
      }
    }
    return parts;
  };

  for (var key in schema) {
    labelParts = buildOutput(labelParts, schema[key], record);
  }

  // de-dupe, join, trim
  return _.uniq( labelParts ).join(', ').trim();
};

function getSchema(country_a) {
  if (country_a && country_a.length && schemas[country_a]) {
    return schemas[country_a];
  }

  return schemas.default;

}
