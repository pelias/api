var _ = require('lodash');
var fuzzy = require('../helper/fuzzyMatch');
var api = require('pelias-config').generate().api;

var schemas = {
  'default': {
    'local': getFirstProperty(['locality', 'localadmin']),
    'country': getFirstProperty(['country'])
  }
};

if (api && api.localization && api.localization.labelSchemas) {
  var imported = api.localization.labelSchemas;

  for (var country in imported) {
    var schema = imported[country];
    for (var key in schema) { // convert to the convention above
      schema[key] = getFirstProperty(schema[key].fields, schema[key].matchType); // param array to func
    }
    schemas[country] = schema;
  }
}

module.exports = schemas;

// find the first field of record that has a non-empty value that's not already in labelParts
function getFirstProperty(fields, matchType) {
  return function(record, req) {

    var matchRegions;
    if(matchType==='best' && req && req.clean && req.clean.parsed_text &&
       req.clean.parsed_text.regions && req.clean.parsed_text.regions.length>0) {
      matchRegions = req.clean.parsed_text.regions;
    }
    var bestScore = -1;
    var bestField;
    for (var i = 0; i < fields.length; i++) {
      var fieldValue = record[fields[i]];

      if (Array.isArray(fieldValue)) {
        fieldValue = fieldValue[0];
      }
      if (!_.isEmpty(fieldValue)) {
        if(matchRegions) {
          var score = fuzzy.matchArray(fieldValue, matchRegions);
          if(score>bestScore) {
            bestScore = score;
            bestField = fieldValue;
          }
        } else { // default case, matchType === 'first'
          return fieldValue;
        }
      }
    }
    return bestField;
  };

}
