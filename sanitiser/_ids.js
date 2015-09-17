var _ = require('lodash'),
    check = require('check-types'),
    types = require('../query/types');

var ID_DELIM = ':';

// validate inputs, convert types and apply defaults
// id generally looks like 'geoname:4163334' (type:id)
// so, both type and id are required fields.

function errorMessage(fieldname, message) {
  return message || 'invalid param \''+ fieldname + '\': text length, must be >0';
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

  var rawIdsString;
  if (check.unemptyString( raw.ids )) {
    rawIdsString = raw.ids;
  } else {
    rawIdsString = '';
  }

  // split string into array of values
  var rawIds = rawIdsString.split(',');

  // deduplicate
  rawIds = _.unique(rawIds);

  // ensure all elements are valid non-empty strings
  rawIds = rawIds.filter( function( uc ){
    if( !check.unemptyString( uc ) ){
      messages.errors.push( errorMessage('ids') );
      return false;
    }
    return true;
  });

  // init 'clean.ids'
  var validIds = [];

  // cycle through raw ids and set those which are valid
  rawIds.forEach( function( rawId ){

    var param_index = rawId.indexOf(ID_DELIM);
    var type = rawId.substring(0, param_index );
    var id   = rawId.substring(param_index + 1);

    // basic format/ presence of ':'
    if(param_index === -1) {
      messages.errors.push( 'invalid: must be of the format type:id for ex: \'geoname:4163334\'' );
    }

    // id text
    else if( !check.unemptyString( id ) ){
      messages.errors.push( errorMessage( rawId ) );
    }
    // type text
    else if( !check.unemptyString( type ) ){
      messages.errors.push( errorMessage( rawId ) );
    }
    // type text must be one of the types
    else if( !_.contains( types, type ) ){
      messages.errors.push( type + ' is invalid. It must be one of these values - [' + types.join(', ') + ']' );
    }
    // add valid id to 'clean.ids' array
    else {
      validIds.push({
        id: id,
        type: type
      });
    }

  });

  if (validIds.length > 0) {
    clean.ids = validIds;
  }

  return messages;
}

// export function
module.exports = sanitize;
