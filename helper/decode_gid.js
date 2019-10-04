const _ = require('lodash');

// helper method to decode a GID from a string
// for additional validation see sanitizer/_ids.js

function decodeGID(gid) {
  const parts = gid.split(':');

  if ( parts.length < 3 ) {
    return;
  }

  // empty strings and other invalid values are expected to be handled by the caller
  return {
    source: parts[0],
    layer: parts[1],
    id: parts.slice(2).join(':'),
  };
}

module.exports = decodeGID;
