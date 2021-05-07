
/**
  Test data required by the ciao test suite.

  Some tests will fail when run against an empty index, you can use this script
  to insert some dummy data in to your index before running the tests.

  note: as this is dummy data, care should be taken in order to make sure these
  documents don't end up in your production index; for that reason the HTTP port
  has been hard-coded as port:9200.
**/

// we use the default config to avoid making calls to
// a cluster running on a non-standard port.
var client = require('elasticsearch').Client(),
    async = require('async'),
    actions = [];
var config = require('pelias-config').generate().api;

// add one record per 'type' in order to cause the _default_ mapping
// to be copied when the new type is created.
var types = ['venue','address','county','region','county','country','admin0','admin1','admin2'],
    sources = ['test'],
    layers = ['geonames'];

// iterate over all types/sources/layers and index a test document
types.forEach( function( type, i1 ){
  sources.forEach( function( source, i2 ){
    layers.forEach( function( layer, i3 ){
      actions.push( function( done ){
        client.index({
          index: config.indexName,
          type: type,
          id: [i1,i2,i3].join(':'),
          body: {
            source: source,
            layer: layer,
            name: { default: 'test' },
            phrase: { default: 'test' },
            parent: {
              country_a: ['USA']
            }
          }
        });
        done();
      });
    });
  });
});

client.index(
  {
    index: config.indexName,
    type: 'address',
    id: 'way:265038872',
    body: {
      'center_point': {
        'lon': -73.990425,
        'lat': 40.744131
      },
      'parent': {
        'country': [
          'United States'
        ],
        'neighbourhood_id': [
          '85869245'
        ],
        'country_a': [
          'USA'
        ],
        'locality_a': [
          null
        ],
        'region_id': [
          '85688543'
        ],
        'county': [
          'New York County'
        ],
        'borough_a': [
          null
        ],
        'borough_id': [
          '421205771'
        ],
        'locality': [
          'New York'
        ],
        'borough': [
          'Manhattan'
        ],
        'region_a': [
          'NY'
        ],
        'county_id': [
          '102081863'
        ],
        'locality_id': [
          '85977539'
        ],
        'neighbourhood_a': [
          null
        ],
        'neighbourhood': [
          'Flatiron District'
        ],
        'region': [
          'New York'
        ],
        'country_id': [
          '85633793'
        ],
        'county_a': [
          null
        ]
      },
      'name': {'default': '30 West 26th Street'},
      'address_parts': {
        'zip': '10010',
        'number': '30',
        'street': 'West 26th Street'
      },
      'alpha3': 'USA',
      'source': 'openstreetmap',
      'source_id': 'way:265038872',
      'layer': 'address'
    }
  }
);

// call refresh so the index merges the changes
actions.push( function( done ){
  client.indices.refresh( { index: config.indexName }, done);
});

// perform all actions in series
async.series( actions, function( err, resp ){
  console.log('test data imported');
});
