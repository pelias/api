const _ = require('lodash');
const peliasConfig = require('pelias-config').generate();
const logger = require('pelias-logger').get('api:type_mapping_discovery');
const { createClient, compatSearch }  = require('./client');

/**
 * This module allows discovery of the sources and layers used
 * in an existing Search Client index.
 *
 * note: this will override any previously configured type mappings.
 */

const DISCOVERY_QUERY = {
  requestCache: true,
  timeout: '10s',
  body: {
    aggs: {
      sources: {
        terms: {
          field: 'source',
          size: 100
        },
        aggs: {
          layers: {
            terms: {
              field: 'layer',
              size: 100
            }
          }
        }
      }
    },
    size: 0
  }
};


module.exports = (tm, done) => {
  const client = createClient(peliasConfig);
  compatSearch(client, DISCOVERY_QUERY, (err, res) => {
    // keep tally of hit counts - compatible with new/old versions of Elasticsearch/OpenSearch
    let totalHits = 0;
    if( _.has(res, 'hits.total') ) {
      totalHits =  _.isPlainObject(res.hits.total) ? res.hits.total.value : res.hits.total;
    }

    // query error
    if( err ){
      logger.error( err );

      if (peliasConfig.get('api.targets.auto_discover_required') === true) {
        process.exit(1);
      }
    }

    // invalid response
    else if ( totalHits < 1 ){
      logger.error( 'no hits for aggregation' );
    }

    // valid response
    else {

      // generate a layers_by_source mapping from the aggregation
      let layersBySource = {};
      let sources = _.get(res, 'aggregations.sources.buckets', []);
      sources.forEach( source => {
        let layers = _.get(source, 'layers.buckets', []);
        layers.forEach( layer => logger.debug( `${source.key} > ${layer.key}`, `= ${layer.doc_count}` ) );
        layersBySource[source.key] = layers.map( layer => layer.key );
      });

      // update type mapping from aggregation data
      if( !!Object.keys( layersBySource ).length ){
        logger.info( 'total hits', totalHits );
        logger.info( 'total sources', sources.length );
        logger.info( 'successfully discovered type mapping from search client' );
        tm.setLayersBySource( layersBySource );

        // (re)generate the mappings
        tm.generateMappings();
      }
    }

    if ('function' === typeof done) { done(); }
  });
};
