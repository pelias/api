const geojsonify = require('../../../helper/geojsonify');
const proxyquire = require('proxyquire').noCallThru();
const codec = require('pelias-model').codec;

module.exports.tests = {};

module.exports.tests.interface = function(test, common) {
  test('valid interface', function(t) {
    t.equal(typeof geojsonify, 'function', 'geojsonify is a function');
    t.equal(geojsonify.length, 2, 'accepts x arguments');
    t.end();
  });
};

// ref: https://github.com/pelias/pelias/issues/84
module.exports.tests.earth = function(test, common) {
  test('earth', function(t) {
    var earth = [{
      '_type': 'geoname',
      '_id': '6295630',
      'source': 'whosonfirst',
      'layer': 'continent',
      'name': {
        'default': 'Earth'
      },
      'center_point': {
        'lon': 0,
        'lat': 0
      }
    }];

    t.doesNotThrow(function(){
      geojsonify( {}, earth );
    });
    t.end();
  });

};

module.exports.tests.all = (test, common) => {
  test('bounding_box should be calculated using points when avaiable', t => {
    const input = [
      {
        _id: 'id 1',
        source: 'source 1',
        source_id: 'source_id 1',
        layer: 'layer 1',
        name: {
          default: 'name 1',
        },
        center_point: {
          lat: 12.121212,
          lon: 21.212121
        }
      },
      {
        _id: 'id 2',
        source: 'source 2',
        source_id: 'source_id 2',
        layer: 'layer 2',
        name: {
          default: 'name 2',
        },
        center_point: {
          lat: 13.131313,
          lon: 31.313131
        }
      }
    ];

    const geojsonify = proxyquire('../../../helper/geojsonify', {
      './geojsonify_place_details': (params, source, dst) => {
        if (source._id === 'id 1') {
          return {
            property1: 'property 1',
            property2: 'property 2'
          };
        } else if (source._id === 'id 2') {
          return {
            property3: 'property 3',
            property4: 'property 4'
          };
        }

      }
    });

    const actual = geojsonify({}, input);

    const expected = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [ 21.212121, 12.121212 ]
          },
          properties: {
            id: 'id 1',
            gid: 'source 1:layer 1:id 1',
            layer: 'layer 1',
            source: 'source 1',
            source_id: 'source_id 1',
            name: 'name 1',
            property1: 'property 1',
            property2: 'property 2'
          }
        },
        {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [ 31.313131, 13.131313 ]
          },
          properties: {
            id: 'id 2',
            gid: 'source 2:layer 2:id 2',
            layer: 'layer 2',
            source: 'source 2',
            source_id: 'source_id 2',
            name: 'name 2',
            property3: 'property 3',
            property4: 'property 4'
          }
        }
      ],
      bbox: [21.212121, 12.121212, 31.313131, 13.131313]
    };

    t.deepEquals(actual, expected);
    t.end();

  });

  test('bounding_box should be calculated using polygons when avaiable', t => {
    const input = [
      {
        _id: 'id 1',
        source: 'source 1',
        source_id: 'source_id 1',
        layer: 'layer 1',
        name: {
          default: 'name 1',
        },
        bounding_box: {
          min_lon: 1,
          min_lat: 1,
          max_lon: 2,
          max_lat: 2
        },
        center_point: {
          lat: 12.121212,
          lon: 21.212121
        }
      },
      {
        _id: 'id 2',
        source: 'source 2',
        source_id: 'source_id 2',
        layer: 'layer 2',
        name: {
          default: 'name 2',
        },
        bounding_box: {
          min_lon: -3,
          min_lat: -3,
          max_lon: -1,
          max_lat: -1
        },
        center_point: {
          lat: 13.131313,
          lon: 31.313131
        }
      }
    ];

    const geojsonify = proxyquire('../../../helper/geojsonify', {
      './geojsonify_place_details': (params, source, dst) => {
        if (source._id === 'id 1') {
          return {
            property1: 'property 1',
            property2: 'property 2'
          };
        } else if (source._id === 'id 2') {
          return {
            property3: 'property 3',
            property4: 'property 4'
          };
        }

      }
    });

    const actual = geojsonify({}, input);

    const expected = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [ 21.212121, 12.121212 ]
          },
          properties: {
            id: 'id 1',
            gid: 'source 1:layer 1:id 1',
            layer: 'layer 1',
            source: 'source 1',
            source_id: 'source_id 1',
            name: 'name 1',
            property1: 'property 1',
            property2: 'property 2'
          },
          bbox: [ 1, 1, 2, 2 ]
        },
        {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [ 31.313131, 13.131313 ]
          },
          properties: {
            id: 'id 2',
            gid: 'source 2:layer 2:id 2',
            layer: 'layer 2',
            source: 'source 2',
            source_id: 'source_id 2',
            name: 'name 2',
            property3: 'property 3',
            property4: 'property 4'
          },
          bbox: [ -3, -3, -1, -1 ]
        }
      ],
      bbox: [ -3, -3, 2, 2 ]
    };

    t.deepEquals(actual, expected);
    t.end();

  });

  test('bounding_box should be calculated using polygons AND points when avaiable', t => {
    const input = [
      {
        _id: 'id 1',
        source: 'source 1',
        source_id: 'source_id 1',
        layer: 'layer 1',
        name: {
          default: 'name 1',
        },
        center_point: {
          lat: 12.121212,
          lon: 21.212121
        }
      },
      {
        _id: 'id 2',
        source: 'source 2',
        source_id: 'source_id 2',
        layer: 'layer 2',
        name: {
          default: 'name 2',
        },
        bounding_box: {
          min_lon: -3,
          min_lat: -3,
          max_lon: -1,
          max_lat: -1
        },
        center_point: {
          lat: 13.131313,
          lon: 31.313131
        }
      }
    ];

    const geojsonify = proxyquire('../../../helper/geojsonify', {
      './geojsonify_place_details': (params, source, dst) => {
        if (source._id === 'id 1') {
          return {
            property1: 'property 1',
            property2: 'property 2'
          };
        } else if (source._id === 'id 2') {
          return {
            property3: 'property 3',
            property4: 'property 4'
          };
        }

      }
    });

    const actual = geojsonify({}, input);

    const expected = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [ 21.212121, 12.121212 ]
          },
          properties: {
            id: 'id 1',
            gid: 'source 1:layer 1:id 1',
            layer: 'layer 1',
            source: 'source 1',
            source_id: 'source_id 1',
            name: 'name 1',
            property1: 'property 1',
            property2: 'property 2'
          }
        },
        {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [ 31.313131, 13.131313 ]
          },
          properties: {
            id: 'id 2',
            gid: 'source 2:layer 2:id 2',
            layer: 'layer 2',
            source: 'source 2',
            source_id: 'source_id 2',
            name: 'name 2',
            property3: 'property 3',
            property4: 'property 4'
          },
          bbox: [ -3, -3, -1, -1 ]
        }
      ],
      bbox: [ -3, -3, 21.212121, 12.121212 ]
    };

    t.deepEquals(actual, expected);
    t.end();

  });

};

module.exports.tests.non_optimal_conditions = (test, common) => {
  test('null/undefined places should log warnings and be ignored', t => {
    const logger = require('pelias-mock-logger')();

    const input = [
      null,
      undefined,
      {
        _id: 'id 1',
        source: 'source 1',
        source_id: 'source_id 1',
        layer: 'layer 1',
        name: {
          default: 'name 1',
        },
        center_point: {
          lat: 12.121212,
          lon: 21.212121
        }
      }
    ];

    const geojsonify = proxyquire('../../../helper/geojsonify', {
      './geojsonify_place_details': (params, source, dst) => {
        if (source._id === 'id 1') {
          return {
            property1: 'property 1',
            property2: 'property 2'
          };
        }
      },
      'pelias-logger': logger
    });

    const actual = geojsonify({}, input);

    const expected = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [ 21.212121, 12.121212 ]
          },
          properties: {
            id: 'id 1',
            gid: 'source 1:layer 1:id 1',
            layer: 'layer 1',
            source: 'source 1',
            source_id: 'source_id 1',
            name: 'name 1',
            property1: 'property 1',
            property2: 'property 2'
          }
        }
      ],
      bbox: [21.212121, 12.121212, 21.212121, 12.121212]
    };

    t.deepEquals(actual, expected);
    t.ok(logger.isWarnMessage('No doc or center_point property'));
    t.end();

  });

  test('places w/o center_point should log warnings and be ignored', t => {
    const logger = require('pelias-mock-logger')();

    const input = [
      {
        _id: 'id 1',
        source: 'source 1',
        source_id: 'source_id 1',
        layer: 'layer 1',
        name: {
          default: 'name 1',
        }
      },
      {
        _id: 'id 2',
        source: 'source 2',
        source_id: 'source_id 2',
        layer: 'layer 2',
        name: {
          default: 'name 2',
        },
        center_point: {
          lat: 13.131313,
          lon: 31.313131
        }
      }
    ];

    const geojsonify = proxyquire('../../../helper/geojsonify', {
      './geojsonify_place_details': (params, source, dst) => {
        if (source._id === 'id 2') {
          return {
            property3: 'property 3',
            property4: 'property 4'
          };
        }
      },
      'pelias-logger': logger
    });

    const actual = geojsonify({}, input);

    const expected = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [ 31.313131, 13.131313 ]
          },
          properties: {
            id: 'id 2',
            gid: 'source 2:layer 2:id 2',
            layer: 'layer 2',
            source: 'source 2',
            source_id: 'source_id 2',
            name: 'name 2',
            property3: 'property 3',
            property4: 'property 4'
          }
        }
      ],
      bbox: [31.313131, 13.131313, 31.313131, 13.131313]
    };

    t.deepEquals(actual, expected);
    t.ok(logger.isWarnMessage('No doc or center_point property'));
    t.end();

  });

  test('places w/o names should log warnings and be ignored', t => {
    const logger = require('pelias-mock-logger')();

    const input = [
      {
        _id: 'id 1',
        source: 'source 1',
        source_id: 'source_id 1',
        layer: 'layer 1',
        center_point: {
          lat: 12.121212,
          lon: 21.212121
        }
      },
      {
        _id: 'id 2',
        source: 'source 2',
        source_id: 'source_id 2',
        layer: 'layer 2',
        name: {},
        center_point: {
          lat: 13.131313,
          lon: 31.313131
        }
      },
      {
        _id: 'id 3',
        source: 'source 3',
        source_id: 'source_id 3',
        layer: 'layer 3',
        name: {
          default: 'name 3',
        },
        center_point: {
          lat: 14.141414,
          lon: 41.414141
        }
      }
    ];

    const geojsonify = proxyquire('../../../helper/geojsonify', {
      './geojsonify_place_details': (params, source, dst) => {
        if (source._id === 'id 1') {
          return {
            property1: 'property 1',
            property2: 'property 2'
          };
        } else if (source._id === 'id 2') {
          return {
            property3: 'property 3',
            property4: 'property 4'
          };
        } else if (source._id === 'id 3') {
          return {
            property5: 'property 5',
            property6: 'property 6'
          };

        }
      },
      'pelias-logger': logger
    });

    const actual = geojsonify({}, input);

    const expected = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [ 21.212121, 12.121212 ]
          },
          properties: {
            id: 'id 1',
            gid: 'source 1:layer 1:id 1',
            layer: 'layer 1',
            source: 'source 1',
            source_id: 'source_id 1',
            property1: 'property 1',
            property2: 'property 2'
          }
        },
        {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [ 31.313131, 13.131313 ]
          },
          properties: {
            id: 'id 2',
            gid: 'source 2:layer 2:id 2',
            layer: 'layer 2',
            source: 'source 2',
            source_id: 'source_id 2',
            property3: 'property 3',
            property4: 'property 4'
          }
        },
        {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [ 41.414141, 14.141414 ]
          },
          properties: {
            id: 'id 3',
            gid: 'source 3:layer 3:id 3',
            layer: 'layer 3',
            source: 'source 3',
            source_id: 'source_id 3',
            name: 'name 3',
            property5: 'property 5',
            property6: 'property 6'
          }
        }
      ],
      bbox: [21.212121, 12.121212, 41.414141, 14.141414]
    };

    t.deepEquals(actual, expected);
    t.ok(logger.isWarnMessage('doc source 1:layer 1:id 1 does not contain name.default'));
    t.ok(logger.isWarnMessage('doc source 2:layer 2:id 2 does not contain name.default'));
    t.end();

  });

  test('no points', t => {
    const logger = require('pelias-mock-logger')();

    const input = [];

    const geojsonify = proxyquire('../../../helper/geojsonify', {
      './geojsonify_place_details': (params, source, dst) => {
        t.fail('should not have bee called');
      },
      'pelias-logger': logger
    });

    const actual = geojsonify({}, input);

    const expected = {
      type: 'FeatureCollection',
      features: []
    };

    t.deepEquals(actual, expected);
    t.end();

  });

};

// ensure that if elasticsearch returns an array of values for name.default
// .. that we handle this case and select the first element for the label.
module.exports.tests.nameAliases = function(test, common) {
  test('name aliases', function(t) {
    var aliases = [{
      '_type': 'example',
      '_id': '1',
      'source': 'example',
      'layer': 'example',
      'name': {
        'default': ['Example1', 'Example2'] // note the array
      },
      'center_point': {
        'lon': 0,
        'lat': 0
      }
    }];

    const expected = {
      type: 'FeatureCollection',
      features: [{
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [ 0, 0 ]
        },
        properties: {
          id: '1',
          gid: 'example:example:1',
          layer: 'example',
          source: 'example',
          source_id: undefined,
          name: 'Example1'
        }
      }],
      bbox: [ 0, 0, 0, 0 ]
    };

    var actual = geojsonify( {}, aliases );
    t.deepEquals(actual, expected);
    t.end();
  });

};

// ensure addendums aree decoded and printed properly
module.exports.tests.addendum = function(test, common) {
  test('addendum: not set in source', function(t) {
    var example = [{
      '_type': 'geoname',
      '_id': '6295630',
      'source': 'whosonfirst',
      'layer': 'continent',
      'name': {
        'default': 'Earth'
      },
      'center_point': {
        'lon': 0,
        'lat': 0
      }
    }];

    let collection = geojsonify({}, example);
    t.false(collection.features[0].properties.addendum);
    t.end();
  });
  test('addendum: set in source', function(t) {
    var example = [{
      '_type': 'geoname',
      '_id': '6295630',
      'source': 'whosonfirst',
      'layer': 'continent',
      'name': {
        'default': 'Earth'
      },
      'center_point': {
        'lon': 0,
        'lat': 0
      },
      'addendum': {
        'wikipedia': codec.encode({ slug: 'HackneyCityFarm' }),
        'geonames': codec.encode({ foreignkey: 1 })
      }
    }];

    let collection = geojsonify({}, example);
    t.deepEqual(collection.features[0].properties.addendum, {
      wikipedia: { slug: 'HackneyCityFarm' },
      geonames: { foreignkey: 1 }
    });
    t.end();
  });
  test('addendum: partially corrupted', function(t) {
    var example = [{
      '_type': 'geoname',
      '_id': '6295630',
      'source': 'whosonfirst',
      'layer': 'continent',
      'name': {
        'default': 'Earth'
      },
      'center_point': {
        'lon': 0,
        'lat': 0
      },
      'addendum': {
        'wikipedia': codec.encode({ slug: 'HackneyCityFarm' }),
        'geonames': 'INVALID ENCODING'
      }
    }];

    let collection = geojsonify({}, example);
    t.deepEqual(collection.features[0].properties.addendum, {
      wikipedia: { slug: 'HackneyCityFarm' }
    });
    t.end();
  });
  test('addendum: all corrupted', function(t) {
    var example = [{
      '_type': 'geoname',
      '_id': '6295630',
      'source': 'whosonfirst',
      'layer': 'continent',
      'name': {
        'default': 'Earth'
      },
      'center_point': {
        'lon': 0,
        'lat': 0
      },
      'addendum': {
        'wikipedia': 'INVALID ENCODING',
        'geonames': 'INVALID ENCODING'
      }
    }];

    let collection = geojsonify({}, example);
    t.false(collection.features[0].properties.addendum);
    t.end();
  });
};

module.exports.all = (tape, common) => {
  function test(name, testFunction) {
    return tape(`geojsonify: ${name}`, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
