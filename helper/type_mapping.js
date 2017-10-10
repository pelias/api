const _ = require('lodash');

function addStandardTargetsToAliases(standard, aliases) {
  var combined = _.extend({}, aliases);
  standard.forEach(function(target) {
    if (combined[target] === undefined) {
      combined[target] = [target];
    }
  });

  return combined;
}

/*
 * Sources
 */

// a list of all sources
var SOURCES = ['openstreetmap', 'openaddresses', 'geonames', 'whosonfirst'];

/*
 * A list of alternate names for sources, mostly used to save typing
 */
var SOURCE_ALIASES = {
  'osm': ['openstreetmap'],
  'oa': ['openaddresses'],
  'gn': ['geonames'],
  'wof': ['whosonfirst']
};

/*
 * Create an object that contains all sources or aliases. The key is the source or alias,
 * the value is either that source, or the canonical name for that alias if it's an alias.
 */
var SOURCE_MAPPING = addStandardTargetsToAliases(SOURCES, SOURCE_ALIASES);

/*
 * Layers
 */

/*
 * A list of all layers in each source. This is used for convenience elswhere
 * and to determine when a combination of source and layer parameters is
 * not going to match any records and will return no results.
 */
var LAYERS_BY_SOURCE = {
 openstreetmap: [ 'address', 'venue', 'street' ],
 openaddresses: [ 'address' ],
 geonames: [ 'country','macroregion', 'region', 'county','localadmin',
  'locality','borough', 'neighbourhood', 'venue' ],
 whosonfirst: [ 'continent', 'empire', 'country', 'dependency', 'macroregion', 'region',
   'locality', 'localadmin', 'macrocounty', 'county', 'macrohood', 'borough',
   'neighbourhood', 'microhood', 'disputed', 'venue', 'postalcode',
   'continent', 'ocean', 'marinearea']
};

/*
 * A list of layer aliases that can be used to support specific use cases
 * (like coarse geocoding) * or work around the fact that different sources
 * may have layers that mean the same thing but have a different name
 */
var LAYER_ALIASES = {
  'coarse': [ 'continent', 'empire', 'country', 'dependency', 'macroregion',
    'region', 'locality', 'localadmin', 'macrocounty', 'county', 'macrohood',
    'borough', 'neighbourhood', 'microhood', 'disputed', 'postalcode',
    'continent', 'ocean', 'marinearea']
};

// create a list of all layers by combining each entry from LAYERS_BY_SOURCE
var LAYERS = _.uniq(Object.keys(LAYERS_BY_SOURCE).reduce(function(acc, key) {
  return acc.concat(LAYERS_BY_SOURCE[key]);
}, []));

/*
 * Create the an object that has a key for each possible layer or alias,
 * and returns either that layer, or all the layers in the alias
 */
var LAYER_MAPPING = addStandardTargetsToAliases(LAYERS, LAYER_ALIASES);

module.exports = {
  sources: SOURCES,
  layers: LAYERS,
  source_mapping: SOURCE_MAPPING,
  layer_mapping: LAYER_MAPPING,
  layers_by_source: LAYERS_BY_SOURCE
};
