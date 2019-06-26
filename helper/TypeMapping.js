const _ = require('lodash');
const loadFromElasticsearch = require('./type_mapping_discovery');

var TypeMapping = function(){

  // A list of all sources
  this.sources = [];

  // A list of alternate names for sources, mostly used to save typing
  this.source_aliases = {};

  // A list of all layers
  this.layers = [];

  /*
   * A list of all layers in each source. This is used for convenience elsewhere
   * to determine when a combination of source and layer parameters is
   * not going to match any records and will return no results.
   */
  this.layers_by_source = {};

  /*
   * A list of layer aliases that can be used to support specific use cases
   * (like coarse geocoding) * or work around the fact that different sources
   * may have layers that mean the same thing but have a different name
   */
  this.layer_aliases = {};

  /*
   * A list of the canonical sources included in the default Pelias configuration
   */
  this.canonical_sources = [];

  /*
   * An object that contains all sources or aliases. The key is the source or alias,
   * the value is either that source, or the canonical name for that alias if it's an alias.
   */
  this.source_mapping = {};

  /*
   * An object that has a key for each possible layer or alias,
   * and returns either that layer, or all the layers in the alias
   */
  this.layer_mapping = {};
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

// source alias setter
TypeMapping.prototype.setSourceAliases = function( aliases ){
  safeReplace(this.source_aliases, aliases);
};

// layers-by-source alias setter
TypeMapping.prototype.setLayersBySource = function( lbs ){
  safeReplace(this.layers_by_source, lbs);
};

// layer alias setter
TypeMapping.prototype.setLayerAliases = function( aliases ){
  safeReplace(this.layer_aliases, aliases);
};

// canonical sources setter
TypeMapping.prototype.setCanonicalSources = function( sources ){
  safeReplace(this.canonical_sources, sources);
};

// generate mappings after setters have been run
TypeMapping.prototype.generateMappings = function(){

  safeReplace(this.sources, Object.keys(this.layers_by_source) );

  safeReplace(
    this.source_mapping,
    TypeMapping.addStandardTargetsToAliases(this.sources, this.source_aliases)
  );

  safeReplace(
    this.layers,
    _.uniq(Object.keys(this.layers_by_source).reduce(function (acc, key) {
      return acc.concat(this.layers_by_source[key]);
    }.bind(this), []))
  );
  
  safeReplace(
    this.layer_mapping,
    TypeMapping.addStandardTargetsToAliases(this.layers, this.layer_aliases)
  );
};

// generate a list of all layers which are part of the canonical Pelias configuration
TypeMapping.prototype.getCanonicalLayers = function(){
  var canonicalLayers = [];
  for( var source in this.layers_by_source ){
    if( _.includes( this.canonical_sources, source ) ){
      canonicalLayers = _.uniq( canonicalLayers.concat( this.layers_by_source[source] ) );
    }
  }
  return canonicalLayers;
};

// load values from targets block
TypeMapping.prototype.loadTargets = function( targetsBlock ){

  if( !_.isObject(targetsBlock) ){ return; }

  // set values from targets block
  this.setSourceAliases( targetsBlock.source_aliases || {} );
  this.setLayersBySource( targetsBlock.layers_by_source || {} );
  this.setLayerAliases( targetsBlock.layer_aliases || {} );
  this.setCanonicalSources( targetsBlock.canonical_sources || [] );

  // generate the mappings
  this.generateMappings();
};

// load values from either pelias config file or from elasticsearch
TypeMapping.prototype.load = function( done ){

  // load pelias config
  const peliasConfigTargets = _.get(
    require('pelias-config').generate(require('../schema')),
    'api.targets', {}
  );

  // load targets from config file
  this.loadTargets( peliasConfigTargets );

  // do not load values from elasticsearch
  if( true !== peliasConfigTargets.auto_discover ){
    if( 'function' === typeof done ){ done(); }
    return;
  }

  // load values from elasticsearch
  loadFromElasticsearch(this, done);
};

// replace the contents of an object or array
// while maintaining the original pointer reference
function safeReplace(reference, replacement){
  if (_.isObject(reference) && _.isObject(replacement) ){
    for( let attr in reference ){ delete reference[attr]; }
    for (let attr in replacement) { reference[attr] = replacement[attr]; }
  } else if (_.isArray(reference) && _.isArray(replacement)) {
    reference.length = 0;
    replacement.forEach(el => reference.push(el));
  }
}

module.exports = TypeMapping;
