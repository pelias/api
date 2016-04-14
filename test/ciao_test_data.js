
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
          index: 'pelias',
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

// call refresh so the index merges the changes
actions.push( function( done ){
  client.indices.refresh( { index: 'pelias' }, done);
});

// perform all actions in series
async.series( actions, function( err, resp ){
  console.log('test data inported');
});
