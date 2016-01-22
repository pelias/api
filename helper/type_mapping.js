var extend = require('extend'),
  _ = require('lodash');

function addStandardTargetsToAliases(standard, aliases) {
  var combined = _.extend({}, aliases);
  standard.forEach(function(target) {
    combined[target] = [target];
  });

  return combined
};

/*
 * Sources
 */
var SOURCES = ['osm', 'openaddresses', 'geonames', 'quattroshapes', 'whosonfirst'];

var SOURCE_ALIASES = {
  'openstreetmap': ['osm'],
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
  'venue': ['venue', 'way', 'node'] // 'venue' is a valid layer for Geonames, so while a little weird,
                                    // this alias that contains itself does actaully work
};

var LAYERS = WOF_LAYERS.concat(QS_LAYERS, ['address', 'way', 'node']);

var LAYER_MAPPING = addStandardTargetsToAliases(LAYERS, LAYER_ALIASES);

module.exports = {
  sources: SOURCES,
  layers: LAYERS,
  source_mapping: SOURCE_MAPPING,
  layer_mapping: LAYER_MAPPING,
};
