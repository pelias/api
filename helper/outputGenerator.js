
var schemas = require('./outputSchema.json');

module.exports = function( record ){

  var adminParts = [];

  var schema = schemas.default;
  
  if (record.alpha3 && record.alpha3.length && schemas[record.alpha3]) {
    schema = schemas[record.alpha3];
  }
  
  var buildOutput = function(parts, schemaArr, record) {
    for (var i=0; i<schemaArr.length; i++) {
      var rec = record[schemaArr[i]];
      if (rec && rec.length) {
        parts.push( rec );
        return parts;
      }
    }
    return parts;
  };

  for (var key in schema) {
    adminParts = buildOutput(adminParts, schema[key], record);  
  }

  var outputs = [ record.name.default ].concat( adminParts );

  // de-dupe outputs
  outputs = outputs.filter( function( i, pos ) {
    return outputs.indexOf( i ) == pos;
  });

  return outputs.join(', ').trim();
};