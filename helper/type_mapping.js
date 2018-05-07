const _ = require('lodash');

var TypeMapping = function(){
  this.sources = [];
  this.source_aliases = {};
  this.layers = [];
  this.layers_by_source = {};
  this.layer_aliases = {};
  this.source_mapping = {};
  this.layer_mapping = {};
  this.layers_by_source = {};
};

TypeMapping.addStandardTargetsToAliases = function(standard, aliases) {
  var combined = _.extend({}, aliases);
  standard.forEach(function(target) {
    if (combined[target] === undefined) {
      combined[target] = [target];
    }
  });

  return combined;
};

TypeMapping.prototype.setSources = function( sources ){ this.sources = sources; };
TypeMapping.prototype.setSourceAliases = function( aliases ){ this.source_aliases = aliases; };
TypeMapping.prototype.setLayersBySource = function( lbs ){ this.layers_by_source = lbs; };
TypeMapping.prototype.setLayerAliases = function( aliases ){ this.layer_aliases = aliases; };
TypeMapping.prototype.generateDynamicMappings = function(){

  /*
   * Create an object that contains all sources or aliases. The key is the source or alias,
   * the value is either that source, or the canonical name for that alias if it's an alias.
   */
  this.source_mapping = TypeMapping.addStandardTargetsToAliases(this.sources, this.source_aliases);

  // create a list of all layers by combining each entry from this.layers_by_source
  this.layers = _.uniq(Object.keys(this.layers_by_source).reduce(function(acc, key) {
    return acc.concat(this.layers_by_source[key]);
  }.bind(this), []));

  /*
   * Create the an object that has a key for each possible layer or alias,
   * and returns either that layer, or all the layers in the alias
   */
  this.layer_mapping = TypeMapping.addStandardTargetsToAliases(this.layers, this.layer_aliases);
};

// instantiate a new type mapping
var tm = new TypeMapping();

// a list of all sources
tm.setSources([ 'openstreetmap', 'openaddresses', 'geonames', 'whosonfirst' ]);

/*
 * A list of alternate names for sources, mostly used to save typing
 */
tm.setSourceAliases({
  'osm': [ 'openstreetmap' ],
  'oa':  [ 'openaddresses' ],
  'gn':  [ 'geonames' ],
  'wof': [ 'whosonfirst' ]
});

/*
 * A list of all layers in each source. This is used for convenience elswhere
 * and to determine when a combination of source and layer parameters is
 * not going to match any records and will return no results.
 */
tm.setLayersBySource({
  openstreetmap: [ 'address', 'venue', 'street' ],
  openaddresses: [ 'address' ],
  geonames: [ 'country','macroregion', 'region', 'county','localadmin',
    'locality','borough', 'neighbourhood', 'venue' ],
  whosonfirst: [ 'continent', 'empire', 'country', 'dependency', 'macroregion',
    'region', 'locality', 'localadmin', 'macrocounty', 'county', 'macrohood', 
    'borough', 'neighbourhood', 'microhood', 'disputed', 'venue', 'postalcode', 
    'continent', 'ocean', 'marinearea' ]
});

/*
 * A list of layer aliases that can be used to support specific use cases
 * (like coarse geocoding) * or work around the fact that different sources
 * may have layers that mean the same thing but have a different name
 */
tm.setLayerAliases({
  'coarse': [ 'continent', 'empire', 'country', 'dependency', 'macroregion',
    'region', 'locality', 'localadmin', 'macrocounty', 'county', 'macrohood',
    'borough', 'neighbourhood', 'microhood', 'disputed', 'postalcode',
    'continent', 'ocean', 'marinearea' ]
});

// generate the dynamic mappings
tm.generateDynamicMappings();

// export singleton
module.exports = tm;