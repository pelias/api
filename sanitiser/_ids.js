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
  if (_.contains([source, layer, id], '')) {
    messages.errors.push( formatError(rawId) );
    return;
  }

  if (!_.contains(type_mapping.sources, source)) {
    messages.errors.push( targetError(source, type_mapping.sources) );
    return;
  }

  if (!_.contains(type_mapping.layers, layer)) {
    messages.errors.push( targetError(layer, type_mapping.layers) );
    return;
  }

  //TODO: remove this once we have a better set of layers for Geonames
  var types;
  if (source === 'gn' || source === 'geonames') {
    types = ['geoname'];
  } else {
    types = type_mapping.source_and_layer_to_type(source, layer);
  }

  return {
    id: id,
    types: types
  };
}

function sanitize( raw, clean ){
  // error & warning messages
  var messages = { errors: [], warnings: [] };

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
