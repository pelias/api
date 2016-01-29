var extend = require('extend'),
  _ = require('lodash');

function addStandardTargetsToAliases(standard, aliases) {
  var combined = _.extend({}, aliases);
  standard.forEach(function(target) {
    if (combined[target] === undefined) {
      combined[target] = [target];
    }
  });

  return combined
};

/*
 * Sources
 */
var SOURCES = ['openstreetmap', 'openaddresses', 'geonames', 'quattroshapes', 'whosonfirst'];

var SOURCE_ALIASES = {
  'osm': ['openstreetmap'],
  'oa': ['openaddresses'],
  'gn': ['geonames'],
  'qs': ['quattroshapes'],
  'wof': ['whosonfirst']
};

var SOURCE_MAPPING = addStandardTargetsToAliases(SOURCES, SOURCE_ALIASES);

/*
 * Layers
 */
var WOF_LAYERS = [ 'continent', 'macrocountry', 'country', 'dependency', 'region', 'locality', 'localadmin', 'county', 'macrohood', 'neighbourhood', 'microhood', 'disputed'];
var QS_LAYERS = ['admin0', 'admin1', 'admin2', 'neighborhood', 'locality', 'local_admin'];

var LAYER_ALIASES = {
  'coarse': WOF_LAYERS.concat(QS_LAYERS),
  'venue': ['venue', 'node', 'way'], // 'venue' is a valid layer for Geonames, so while a little weird,
                                     // this alias that contains itself does actaully work.
  'country': ['country', 'admin0'],  // Include both QS and WOF layers for various types of places
  'region': ['region', 'admin1']
};

var LAYERS = WOF_LAYERS.concat(QS_LAYERS, ['address', 'way', 'node', 'venue']);

var LAYER_MAPPING = addStandardTargetsToAliases(LAYERS, LAYER_ALIASES);
console.log(SOURCE_MAPPING);

module.exports = {
  sources: SOURCES,
  layers: LAYERS,
  source_mapping: SOURCE_MAPPING,
  layer_mapping: LAYER_MAPPING,
};
