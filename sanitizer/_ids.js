var _ = require('lodash'),
    check = require('check-types'),
    type_mapping = require('../helper/type_mapping');

var ID_DELIM = ':';

// validate inputs, convert types and apply defaults id generally looks like
// 'geonames:venue:4163334' (source:layer:id) so, all three are required

var lengthError = 'invalid param \'ids\': length must be >0';

var formatError = function(input) {
  return 'id `' + input + ' is invalid: must be of the format source:layer:id for ex: \'geonames:venue:4163334\'';
};

var targetError = function(target, target_list) {
  return target + ' is invalid. It must be one of these values - [' + target_list.join(', ') + ']';
};

function sanitizeId(rawId, messages) {
  var parts = rawId.split(ID_DELIM);

  if ( parts.length < 3 ) {
    messages.errors.push( formatError(rawId) );
    return;
  }

  var source = parts[0];
  var layer = parts[1];
  var id = parts.slice(2).join(ID_DELIM);

  // check if any parts of the gid are empty
  if (_.includes([source, layer, id], '')) {
    messages.errors.push( formatError(rawId) );
    return;
  }
  var valid_values = Object.keys(type_mapping.source_mapping);
  if (!_.includes(valid_values, source)) {
    messages.errors.push( targetError(source, valid_values) );
    return;
  }

  if (!_.includes(type_mapping.layers, layer)) {
    messages.errors.push( targetError(layer, type_mapping.layers) );
    return;
  }

  return {
    source: type_mapping.source_mapping[source][0],
    layer: layer,
    id: id,
  };
}

function _sanitize( raw, clean ){
  // error & warning messages
  var messages = { errors: [], warnings: [] };

  if (!check.nonEmptyString( raw.ids )) {
    messages.errors.push( lengthError);
    return messages;
  }

  // split string into array of values
  var rawIds = raw.ids.split(',');

  // deduplicate
  rawIds = _.uniq(rawIds);

  // ensure all elements are valid non-empty strings
  if (!rawIds.every(check.nonEmptyString)) {
      messages.errors.push( lengthError );
  }

  // cycle through raw ids and set those which are valid
  var validIds = rawIds.map(function(rawId) {
    return sanitizeId(rawId, messages);
  });

  if (validIds.every(check.object)) {
    clean.ids = validIds;
  }

  return messages;
}

function _expected(){
  return [{ name: 'ids' }];
}
// export function
module.exports = () => ({
  sanitize: _sanitize,
  expected: _expected
});
