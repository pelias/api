const _ = require('lodash');
const decode_gid = require('./decode_gid');

// A record's id within its source is the third component of the elasticsearch
// document _id, which has the format `source:layer:id`.
function getSourceId(place) {
  const gid = decode_gid(_.get(place, '_id', ''));
  return _.get(gid, 'id');
}

module.exports = getSourceId;
