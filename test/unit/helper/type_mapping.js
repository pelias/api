const proxyquire = require('proxyquire').noCallThru();

const realPeliasConfig = require('pelias-config');

const defaultPeliasConfig = {
  generate: function() {
    return realPeliasConfig.defaults;
  }
};

// test the actual module, rather than the singleton wrapper
var TypeMapping = proxyquire('../../../helper/TypeMapping', {
  'pelias-config': defaultPeliasConfig
});

const type_mapping = new TypeMapping();
type_mapping.load();

module.exports.tests = {};

module.exports.tests.interfaces = function(test, common) {

  test('complete sources', function(t) {
    t.deepEquals(type_mapping.sources, [ 'openstreetmap', 'openaddresses', 'geonames', 'whosonfirst' ]);
    t.end();
  });

  test('complete layers', function(t) {
    t.deepEquals(type_mapping.layers, [ 'address', 'venue', 'street', 'country', 'macroregion',
      'region', 'county', 'localadmin', 'locality', 'borough', 'neighbourhood', 'continent',
      'empire', 'dependency', 'macrocounty', 'macrohood', 'microhood', 'disputed',
      'postalcode', 'ocean', 'marinearea' ]);
    t.end();
  });

  test('complete source mapping', function(t) {
    t.deepEquals(type_mapping.source_mapping, {
      osm: [ 'openstreetmap' ],
      oa: [ 'openaddresses' ],
      gn: [ 'geonames' ],
      wof: [ 'whosonfirst' ],
      openstreetmap: [ 'openstreetmap' ],
      openaddresses: [ 'openaddresses' ],
      geonames: [ 'geonames' ],
      whosonfirst: [ 'whosonfirst' ]
    });
    t.end();
  });

  test('basic source mapping', function(t) {
    t.deepEquals(type_mapping.source_mapping.osm, ['openstreetmap']);
    t.deepEquals(type_mapping.source_mapping.openaddresses, ['openaddresses']);
    t.end();
  });

  test('alias source mapping', function(t) {
    t.deepEquals(type_mapping.source_mapping.openstreetmap, ['openstreetmap']);
    t.deepEquals(type_mapping.source_mapping.wof, ['whosonfirst']);
    t.end();
  });

  test('complete layer mapping', function(t) {
    t.deepEquals(type_mapping.layer_mapping, {
      coarse: [ 'continent', 'empire', 'country', 'dependency', 'macroregion', 'region',
        'locality', 'localadmin', 'macrocounty', 'county', 'macrohood', 'borough',
        'neighbourhood', 'microhood', 'disputed', 'postalcode', 'continent', 'ocean', 'marinearea'
      ],
      address: [ 'address' ],
      venue: [ 'venue' ],
      street: [ 'street' ],
      country: [ 'country' ],
      macroregion: [ 'macroregion' ],
      region: [ 'region' ],
      county: [ 'county' ],
      localadmin: [ 'localadmin' ],
      locality: [ 'locality' ],
      borough: [ 'borough' ],
      neighbourhood: [ 'neighbourhood' ],
      continent: [ 'continent' ],
      empire: [ 'empire' ],
      dependency: [ 'dependency' ],
      macrocounty: [ 'macrocounty' ],
      macrohood: [ 'macrohood' ],
      microhood: [ 'microhood' ],
      disputed: [ 'disputed' ],
      postalcode: [ 'postalcode' ],
      ocean: [ 'ocean' ],
      marinearea: [ 'marinearea' ]
    });
    t.end();
  });

  test('basic layer mapping', function(t) {
    t.deepEquals(type_mapping.layer_mapping.venue, ['venue']);
    t.deepEquals(type_mapping.layer_mapping.address, ['address']);
    t.end();
  });

  test('alias layer mapping', function(t) {
    t.deepEquals(type_mapping.layer_mapping.coarse,
                 [ 'continent', 'empire', 'country', 'dependency', 'macroregion',
                   'region', 'locality', 'localadmin', 'macrocounty', 'county', 'macrohood',
                   'borough', 'neighbourhood', 'microhood', 'disputed', 'postalcode',
                   'continent', 'ocean', 'marinearea']);
    t.end();
  });

  test('complete layers by source', function(t) {
    t.deepEquals(type_mapping.layers_by_source, {
      openstreetmap: [ 'address', 'venue', 'street' ],
      openaddresses: [ 'address' ],
      geonames: [ 'country', 'macroregion', 'region', 'county', 'localadmin',
        'locality', 'borough', 'neighbourhood', 'venue' ],
      whosonfirst: [ 'continent', 'empire', 'country', 'dependency', 'macroregion',
        'region', 'locality', 'localadmin', 'macrocounty', 'county', 'macrohood',
        'borough', 'neighbourhood', 'microhood', 'disputed', 'venue', 'postalcode',
        'continent', 'ocean', 'marinearea' ]
    });
    t.end();
  });
};

module.exports.all = function (tape, common) {
  function test(name, testFunction) {
    return tape('type_mapping: ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
