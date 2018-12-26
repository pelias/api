var _ = require('lodash'),
    check = require('check-types');

function _sanitize(raw, clean) {
  // error & warning messages
  var messages = { errors: [], warnings: [] };

  // target input param
  var boundary_gid = raw['boundary.gid'];

  // param 'boundary.gid' is optional and should not
  // error when simply not set by the user
  // must be valid string
  if (check.assigned(boundary_gid)) {
    if (!check.nonEmptyString(boundary_gid)) {
      messages.errors.push('boundary.gid is not a string');
    }
    else {
      // boundary gid should take the form of source:layer:id,
      // or source:layer:type:id for OpenStreetMap ids
      var fields = boundary_gid.split(':').filter(function(x) {
          // keep only non-empty values
          return x !== '';
      });
      if ( _.inRange(fields.length, 3, 5) ) {
         clean['boundary.gid'] = fields.slice(2).join(':');
      }
      else {
        messages.errors.push(boundary_gid + ' does not follow source:layer:id format');
      }
    }
  }

  return messages;
}

function _expected(){
  return [{ name: 'boundary.gid' }];
}

module.exports = () => ({
  sanitize: _sanitize,
  expected: _expected
});
