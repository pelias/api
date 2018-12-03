const check = require('check-types');

function _sanitize(raw, clean) {
  // error & warning messages
  var messages = { errors: [], warnings: [] };

  // target input param
  var wof_id = raw['boundary.wof'];

  // param 'boundary.wof' is optional and should not
  // error when simply not set by the user
  // must be valid string
  if (check.assigned(wof_id)) {
    if (!check.nonEmptyString(wof_id)) {
      messages.errors.push('boundary.wof is not a string');
    }

    // must be only digits
    else if ( /^\d+$/.test(wof_id) ) {
      clean['boundary.wof'] = parseInt(wof_id, 10);
    }

    else {
      messages.errors.push(wof_id + ' is not a valid integer');
    }
  }

  return messages;
}

function _expected(){
  return [{ name: 'boundary.wof' }];
}

module.exports = () => ({
  sanitize: _sanitize,
  expected: _expected
});
