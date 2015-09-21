var _ = require('lodash'),
    check = require('check-types'),
    type_mapping = require('../helper/type_mapping'),
    types = type_mapping.types_list;

var ID_DELIM = ':';

// validate inputs, convert types and apply defaults
// id generally looks like 'geoname:4163334' (type:id)
// so, both type and id are required fields.

var lengthError = 'invalid param \'ids\': length must be >0';

var formatError = function(input) {
  return 'id `' + input + 'is invalid: must be of the format type:id for ex: \'geoname:4163334\'';
};

function sanitizeId(rawId, messages) {
  var param_index = rawId.indexOf(ID_DELIM);
  var type = rawId.substring(0, param_index );
  var id   = rawId.substring(param_index + 1);

  // check id format
  if(!check.contains(rawId, ID_DELIM) || !check.unemptyString( id ) || !check.unemptyString( type )) {
    messages.errors.push( formatError(rawId) );
  }
  // type text must be one of the types
  else if( !_.contains( types, type ) ){
    messages.errors.push( type + ' is invalid. It must be one of these values - [' + types.join(', ') + ']' );
  }
  else {
    return {
      id: id,
      type: type
    };
  }
}

function sanitize( raw, clean ){
  // error & warning messages
  var messages = { errors: [], warnings: [] };

  // 'raw.ids' can be an array if ids is specified multiple times
  // see https://github.com/pelias/api/issues/272
  if (check.array( raw.ids )) {
    messages.errors.push( '`ids` parameter specified multiple times.' );
    return messages;
  }

  if (!check.unemptyString( raw.ids )) {
    messages.errors.push( lengthError);
    return messages;
  }

  // split string into array of values
  var rawIds = raw.ids.split(',');

  // deduplicate
  rawIds = _.unique(rawIds);

  // ensure all elements are valid non-empty strings
  if (!rawIds.every(check.unemptyString)) {
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

// export function
module.exports = sanitize;
