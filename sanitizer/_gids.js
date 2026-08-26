const _ = require('lodash');

const _sanitize = (key) => (raw, clean) => {
  // error & warning messages
  var messages = { errors: [], warnings: [] };

  // target input param
  var boundary_gid = raw[`${key}.gid`];

  // param `${key}.gid` is optional and should not
  // error when simply not set by the user
  // must be valid string
  if (!_.isNil(boundary_gid)) {
    if (!_.isString(boundary_gid) || _.isEmpty(boundary_gid)) {
      messages.errors.push(`${key}.gid is not a string`);
    }
    else {
      // boundary gid should take the form of source:layer:id,
      // or source:layer:type:id for OpenStreetMap ids
      var fields = boundary_gid.split(':').filter(function(x) {
          // keep only non-empty values
          return x !== '';
      });
      if ( _.inRange(fields.length, 3, 5) ) {
         clean[`${key}.gid`] = fields.slice(2).join(':');
      }
      else {
        messages.errors.push(boundary_gid + ' does not follow source:layer:id format');
      }
    }
  }

  return messages;
};

function _expected(key) {
  return () => [{ name: `${key}.gid` }];
}

module.exports = (key = 'boundary') => ({
  sanitize: _sanitize(key),
  expected: _expected(key)
});
