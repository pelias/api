var Document = require('pelias-model').Document;

/**
 * Determine and set place id, type, and source
 *
 * @param {object} src
 * @param {object} dst
 */
function addMetaData(src, dst) {
  dst.id = src._id;

  // at this time the gid's of interpolated addresses are not usable in the place endpoint
  // to avoid confusion they will be removed altogether for now and replaced in the future when we have determined
  // the right format for these types of results
  if (src.source !== 'mixed') {
    dst.gid = makeGid(src);
  }

  dst.layer = lookupLayer(src);
  dst.source = lookupSource(src);
  dst.source_id = lookupSourceId(src);
  if (src.hasOwnProperty('bounding_box')) {
    dst.bounding_box = src.bounding_box;
  }
}

/**
 * Create a gid from a document
 *
 * @param {object} src
 */
function makeGid(src) {
  var doc = new Document(lookupSource(src), lookupLayer(src), src._id);
  return doc.getGid();
}

function lookupSource(src) {
  return src.source;
}

function lookupSourceId(src) {
  return src.source_id;
}

function lookupLayer(src) {
  return src.layer;
}

module.exports = addMetaData;