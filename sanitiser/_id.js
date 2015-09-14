
var check = require('check-types'),
    types = require('../query/types');

var ID_DELIM = ':';

// validate inputs, convert types and apply defaults
// id generally looks like 'geoname:4163334' (type:id)
// so, both type and id are required fields.

function errorMessage(fieldname, message) {
  return message || 'invalid param \''+ fieldname + '\': text length, must be >0';
}

function sanitize( unclean, clean ){

  // error & warning messages
  var messages = { errors: [], warnings: [] };

  // 'unclean.id' can be an array!?
  var uncleanIds = check.array( unclean.id ) ? unclean.id : [ unclean.id ];

  // de-dupe ids
  uncleanIds = uncleanIds.filter(function(item, pos) {
    return uncleanIds.indexOf( item ) === pos;
  });

  // ensure all elements are valid non-empty strings
  uncleanIds = uncleanIds.filter( function( uc ){
    if( !check.unemptyString( uc ) ){
      messages.errors.push( errorMessage('id') );
      return false;
    }
    return true;
  });

  // init 'clean.ids'
  clean.ids = [];

  // cycle through unclean ids and set those which are valid
  uncleanIds.forEach( function( uncleanId ){

    var param_index = uncleanId.indexOf(ID_DELIM);
    var type = uncleanId.substring(0, param_index );
    var id   = uncleanId.substring(param_index + 1);

    // basic format/ presence of ':'
    if(param_index === -1) {
      messages.errors.push(
        errorMessage(null, 'invalid: must be of the format type:id for ex: \'geoname:4163334\'')
      );
    }

    // id text
    if( !check.unemptyString( id ) ){
      messages.errors.push( errorMessage( uncleanId ) );
    }
    // type text
    if( !check.unemptyString( type ) ){
      messages.errors.push( errorMessage( uncleanId ) );
    }
    // type text must be one of the types
    if( types.indexOf( type ) === -1 ){
      messages.errors.push(
        errorMessage('type', type + ' is invalid. It must be one of these values - [' + types.join(', ') + ']')
      );
    }

    // add valid id to 'clean.ids' array
    clean.ids.push({
      id: id,
      type: type
    });
  });

  return messages;
}

// export function
module.exports = sanitize;
