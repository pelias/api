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

  // 'raw.id' can be an array
  var rawIds = check.array( raw.id ) ? _.unique( raw.id ) : [];

  // 'raw.id' can be a string
  if( check.unemptyString( raw.id ) ){
    rawIds.push( raw.id );
  }

  // no ids provided
  if( !rawIds.length ){
    messages.errors.push( errorMessage('id') );
  }

  // ensure all elements are valid non-empty strings
  rawIds = rawIds.filter( function( uc ){
    if( !check.unemptyString( uc ) ){
      messages.errors.push( errorMessage('id') );
      return false;
    }
    return true;
  });

  // init 'clean.ids'
  clean.ids = [];

  // cycle through raw ids and set those which are valid
  rawIds.forEach( function( rawId ){

    var param_index = rawId.indexOf(ID_DELIM);
    var type = rawId.substring(0, param_index );
    var id   = rawId.substring(param_index + 1);

    // basic format/ presence of ':'
    if(param_index === -1) {
      messages.errors.push(
        errorMessage(null, 'invalid: must be of the format type:id for ex: \'geoname:4163334\'')
      );
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
      messages.errors.push(
        errorMessage('type', type + ' is invalid. It must be one of these values - [' + types.join(', ') + ']')
      );
    }
    // add valid id to 'clean.ids' array
    else {
      clean.ids.push({
        id: id,
        type: type
      });
    }

  });

  return messages;
}

// export function
module.exports = sanitize;
