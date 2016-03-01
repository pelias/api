
var _ = require('lodash'),
    check = require('check-types'),
    schemas = require('./labelSchema.json');

module.exports = function( record ){

  var labelParts = [ record.name.default ];

  var schema = schemas.default;
  
  if (record.country_a && record.country_a.length && schemas[record.country_a]) {
    schema = schemas[record.country_a];
  }
  
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

  // de-dupe outputs
  labelParts = _.uniq( labelParts );

  return labelParts.join(', ').trim();
};