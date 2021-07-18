const generateQuery = require('../../../query/address_search_using_ids');
const _ = require('lodash');
const proxyquire = require('proxyquire').noCallThru();
const mock_logger = require('pelias-mock-logger');
const MockQuery = require('./MockQuery');

module.exports.tests = {};

module.exports.tests.interface = (test, common) => {
  test('valid interface', (t) => {
    t.ok(_.isFunction(generateQuery));
    t.end();
  });
};

// helper for canned views
const views = {
  focus_only_function: () => 'focus_only_function',
  boundary_country: 'boundary_country view',
  boundary_circle: 'boundary_circle view',
  boundary_rect: 'boundary_rect view',
  sources: 'sources view',
  boundary_gid: 'boundary_gid view',
  layers: 'layers view'
};

module.exports.tests.base_query = (test, common) => {
  test('basic', (t) => {
    const logger = mock_logger();

    const clean = {
      parsed_text: {
        housenumber: 'housenumber value',
        postalcode: 'postcode value',
        street: 'street value',
      },
      layers: ['venue', 'street', 'address']
    };

    const res = {
      data: []
    };

    const generateQuery = proxyquire('../../../query/address_search_using_ids', {
      'pelias-logger': logger,
      'pelias-query': {
        layout: {
          AddressesUsingIdsQuery: MockQuery
        },
        view: views,
        Vars: require('pelias-query').Vars
      }
    });

    const generatedQuery = generateQuery(clean, res);

    t.equals(generatedQuery.type, 'address_search_using_ids');

    t.equals(generatedQuery.body.vs.var('input:housenumber').toString(), 'housenumber value');
    t.equals(generatedQuery.body.vs.var('input:postcode').toString(), 'postcode value');
    t.equals(generatedQuery.body.vs.var('input:street').toString(), 'street value');
    t.deepEquals(generatedQuery.body.vs.var('layers').toString(), [ 'venue', 'street', 'address' ]);
    t.notOk(generatedQuery.body.vs.isset('sources'));
    t.equals(generatedQuery.body.vs.var('size').toString(), 20);

    t.deepEquals(generatedQuery.body.score_functions, [
      'focus_only_function'
    ]);

    t.deepEquals(generatedQuery.body.filter_functions, [
      'boundary_country view',
      'boundary_circle view',
      'boundary_rect view',
      'sources view',
      'boundary_gid view',
      'layers view'
    ]);

    t.end();

  });
};

module.exports.tests.other_parameters = (test, common) => {
  test('explicit size set', (t) => {
    const logger = mock_logger();

    const clean = {
      parsed_text: {
        housenumber: 'housenumber value',
        street: 'street value'
      },
      querySize: 'querySize value'
    };
    const res = {
      data: []
    };

    const generateQuery = proxyquire('../../../query/address_search_using_ids', {
      'pelias-logger': logger,
      'pelias-query': {
        layout: {
          AddressesUsingIdsQuery: MockQuery
        },
        view: views,
        Vars: require('pelias-query').Vars
      }
    });

    const generatedQuery = generateQuery(clean, res);

    t.equals(generatedQuery.body.vs.var('size').toString(), 'querySize value');
    t.end();

  });

  test('explicit sources set', (t) => {
    const logger = mock_logger();

    const clean = {
      parsed_text: {
        housenumber: 'housenumber value',
        street: 'street value'
      },
      sources: ['source 1', 'source 2']
    };
    const res = {
      data: []
    };

    const generateQuery = proxyquire('../../../query/address_search_using_ids', {
      'pelias-logger': logger,
      'pelias-query': {
        layout: {
          AddressesUsingIdsQuery: MockQuery
        },
        view: views,
        Vars: require('pelias-query').Vars
      }
    });

    const generatedQuery = generateQuery(clean, res);

    t.deepEquals(generatedQuery.body.vs.var('sources').toString(), ['source 1', 'source 2']);
    t.end();

  });

  test('address_parts.street slop defaults to 4', (t) => {
    const logger = mock_logger();

    const clean = {
      parsed_text: {
        housenumber: 'housenumber value',
        street: 'street value'
      }
    };
    const res = {
      data: []
    };

    const generateQuery = proxyquire('../../../query/address_search_using_ids', {
      'pelias-logger': logger,
      'pelias-query': {
        layout: {
          AddressesUsingIdsQuery: MockQuery
        },
        view: views,
        Vars: require('pelias-query').Vars
      }
    });

    const generatedQuery = generateQuery(clean, res);

    t.deepEquals(generatedQuery.body.vs.var('address:street:slop').toString(), 4);
    t.end();
  });
};

module.exports.tests.granularity_bands = (test, common) => {
  test('neighbourhood/borough/locality/localadmin granularity band', (t) => {
    const logger = mock_logger();

    const clean = {
      parsed_text: {
        housenumber: 'housenumber value',
        street: 'street value'
      }
    };


    const res = {
      data: [
        {
          layer: 'neighbourhood',
          source_id: 1,
          bounding_box: '{"min_lat":1,"max_lat":10,"min_lon":100,"max_lon":1000}'
        },
        {
          layer: 'borough',
          source_id: 2,
          bounding_box: '{"min_lat":2,"max_lat":20,"min_lon":200,"max_lon":2000}'
        },
        {
          layer: 'locality',
          source_id: 3,
          bounding_box: '{"min_lat":3,"max_lat":30,"min_lon":300,"max_lon":3000}'
        },
        {
          layer: 'localadmin',
          source_id: 4,
          bounding_box: '{"min_lat":4,"max_lat":40,"min_lon":400,"max_lon":4000}'
        },
        {
          layer: 'county',
          source_id: 5,
          bounding_box: '{"min_lat":5,"max_lat":50,"min_lon":500,"max_lon":5000}'
        },
        {
          layer: 'macrocounty',
          source_id: 6,
          bounding_box: '{"min_lat":6,"max_lat":60,"min_lon":600,"max_lon":6000}'
        },
        {
          layer: 'region',
          source_id: 7,
          bounding_box: '{"min_lat":7,"max_lat":70,"min_lon":700,"max_lon":7000}'
        },
        {
          layer: 'macroregion',
          source_id: 8,
          bounding_box: '{"min_lat":8,"max_lat":80,"min_lon":800,"max_lon":8000}'
        },
        {
          layer: 'dependency',
          source_id: 9,
          bounding_box: '{"min_lat":9,"max_lat":90,"min_lon":900,"max_lon":9000}'
        },
        {
          layer: 'country',
          source_id: 10,
          bounding_box: '{"min_lat":10,"max_lat":100,"min_lon":1000,"max_lon":10000}'
        },
        {
          layer: 'neighbourhood',
          source_id: 11,
          bounding_box: '{"min_lat":11,"max_lat":110,"min_lon":1100,"max_lon":11000}'
        },
        {
          layer: 'borough',
          source_id: 12,
          bounding_box: '{"min_lat":12,"max_lat":120,"min_lon":1200,"max_lon":12000}'
        },
        {
          layer: 'locality',
          source_id: 13,
          bounding_box: '{"min_lat":13,"max_lat":130,"min_lon":1300,"max_lon":13000}'
        },
        {
          layer: 'localadmin',
          source_id: 14,
          bounding_box: '{"min_lat":14,"max_lat":140,"min_lon":1400,"max_lon":14000}'
        },
        {
          layer: 'county',
          source_id: 15,
          bounding_box: '{"min_lat":15,"max_lat":150,"min_lon":1500,"max_lon":15000}'
        },
        {
          layer: 'macrocounty',
          source_id: 16,
          bounding_box: '{"min_lat":16,"max_lat":160,"min_lon":1600,"max_lon":16000}'
        },
        {
          layer: 'region',
          source_id: 17,
          bounding_box: '{"min_lat":17,"max_lat":170,"min_lon":1700,"max_lon":17000}'
        },
        {
          layer: 'macroregion',
          source_id: 18,
          bounding_box: '{"min_lat":18,"max_lat":180,"min_lon":1800,"max_lon":18000}'
        },
        {
          layer: 'dependency',
          source_id: 19,
          bounding_box: '{"min_lat":19,"max_lat":190,"min_lon":1900,"max_lon":19000}'
        },
        {
          layer: 'country',
          source_id: 20,
          bounding_box: '{"min_lat":20,"max_lat":200,"min_lon":2000,"max_lon":20000}'
        }
      ]
    };

    const generateQuery = proxyquire('../../../query/address_search_using_ids', {
      'pelias-logger': logger,
      'pelias-query': {
        layout: {
          AddressesUsingIdsQuery: MockQuery
        },
        view: views,
        Vars: require('pelias-query').Vars
      }

    });

    const generatedQuery = generateQuery(clean, res);

    t.deepEquals(generatedQuery.body.vs.var('input:layers:ids').$, {
      neighbourhood: [1, 11],
      borough: [2, 12],
      locality: [3, 13],
      localadmin: [4, 14],
      region: [7, 17],
      macroregion: [8, 18],
      dependency: [9, 19],
      country: [10, 20]
    });


    t.deepEquals(generatedQuery.body.vs.var('input:layers:bounding_boxes').$, {
      neighbourhood: [
        { min_lat: 1, max_lat: 10, min_lon: 100, max_lon: 1000 },
        { min_lat: 11, max_lat: 110, min_lon: 1100, max_lon: 11000 },
      ],
      borough: [
        { min_lat: 2, max_lat: 20, min_lon: 200, max_lon: 2000 },
        { min_lat: 12, max_lat: 120, min_lon: 1200, max_lon: 12000 },
      ],
      locality: [
        { min_lat: 3, max_lat: 30, min_lon: 300, max_lon: 3000 },
        { min_lat: 13, max_lat: 130, min_lon: 1300, max_lon: 13000 },
      ],
      localadmin: [
        { min_lat: 4, max_lat: 40, min_lon: 400, max_lon: 4000 },
        { min_lat: 14, max_lat: 140, min_lon: 1400, max_lon: 14000 },
      ],
      region: [
        { min_lat: 7, max_lat: 70, min_lon: 700, max_lon: 7000 },
        { min_lat: 17, max_lat: 170, min_lon: 1700, max_lon: 17000 },
      ],
      macroregion: [
        { min_lat: 8, max_lat: 80, min_lon: 800, max_lon: 8000 },
        { min_lat: 18, max_lat: 180, min_lon: 1800, max_lon: 18000 },
      ],
      dependency: [
        { min_lat: 9, max_lat: 90, min_lon: 900, max_lon: 9000 },
        { min_lat: 19, max_lat: 190, min_lon: 1900, max_lon: 19000 },
      ],
      country: [
        { min_lat: 10, max_lat: 100, min_lon: 1000, max_lon: 10000 },
        { min_lat: 20, max_lat: 200, min_lon: 2000, max_lon: 20000 },
      ],
    });

    t.end();
  });

  test('only band members with ids should be passed', (t) => {
    const logger = mock_logger();

    const clean = {
      parsed_text: {
        housenumber: 'housenumber value',
        street: 'street value'
      }
    };
    const res = {
      data: [
        {
          layer: 'neighbourhood',
          source_id: 1
        }
      ]
    };

    const generateQuery = proxyquire('../../../query/address_search_using_ids', {
      'pelias-logger': logger,
      'pelias-query': {
        layout: {
          AddressesUsingIdsQuery: MockQuery
        },
        view: views,
        Vars: require('pelias-query').Vars
      }
    });

    const generatedQuery = generateQuery(clean, res);

    t.deepEquals(generatedQuery.body.vs.var('input:layers:ids').$, {
      neighbourhood: [1],
      borough: [],
      locality: [],
      localadmin: [],
      region: [],
      macroregion: [],
      dependency: [],
      country: []
    });

    t.end();
  });

  test('county/macrocounty granularity band', (t) => {
    const logger = mock_logger();

    const clean = {
      parsed_text: {
        housenumber: 'housenumber value',
        street: 'street value'
      }
    };
    const res = {
      data: [
        {
          layer: 'county',
          source_id: 1
        },
        {
          layer: 'macrocounty',
          source_id: 2
        },
        {
          layer: 'county',
          source_id: 4
        },
        {
          layer: 'macrocounty',
          source_id: 5
        }
      ]
    };

    const generateQuery = proxyquire('../../../query/address_search_using_ids', {
      'pelias-logger': logger,
      'pelias-query': {
        layout: {
          AddressesUsingIdsQuery: MockQuery
        },
        view: views,
        Vars: require('pelias-query').Vars
      }

    });

    const generatedQuery = generateQuery(clean, res);

    t.deepEquals(generatedQuery.body.vs.var('input:layers:ids').$, {
      county: [1, 4],
      macrocounty: [2, 5]
    });

    t.end();
  });

};

module.exports.tests.boundary_filters = (test, common) => {
  test('boundary.country available should add to query', (t) => {
    const logger = mock_logger();

    const clean = {
      parsed_text: {
        housenumber: 'housenumber value',
        street: 'street value'
      },
      'boundary.country': ['boundary.country', 'value']
    };
    const res = {};

    const generateQuery = proxyquire('../../../query/address_search_using_ids', {
      'pelias-logger': logger,
      'pelias-query': {
        layout: {
          AddressesUsingIdsQuery: MockQuery
        },
        view: views,
        Vars: require('pelias-query').Vars
      }

    });

    const generatedQuery = generateQuery(clean, res);

    t.equals(generatedQuery.body.vs.var('boundary:country').toString(), 'boundary.country value');

    t.end();

  });

  test('focus.point.lat/lon w/both numbers should add to query', (t) => {
    const logger = mock_logger();

    const clean = {
      parsed_text: {
        housenumber: 'housenumber value',
        street: 'street value'
      },
      'focus.point.lat': 12.121212,
      'focus.point.lon': 21.212121
    };
    const res = {};

    const generateQuery = proxyquire('../../../query/address_search_using_ids', {
      'pelias-logger': logger,
      'pelias-query': {
        layout: {
          AddressesUsingIdsQuery: MockQuery
        },
        view: views,
        Vars: require('pelias-query').Vars
      }

    });

    const generatedQuery = generateQuery(clean, res);

    t.equals(generatedQuery.body.vs.var('focus:point:lat').toString(), 12.121212);
    t.equals(generatedQuery.body.vs.var('focus:point:lon').toString(), 21.212121);

    t.end();

  });

  test('boundary.rect with all numbers should add to query', (t) => {
    const logger = mock_logger();

    const clean = {
      parsed_text: {
        housenumber: 'housenumber value',
        street: 'street value'
      },
      'boundary.rect.min_lat': 12.121212,
      'boundary.rect.max_lat': 13.131313,
      'boundary.rect.min_lon': 21.212121,
      'boundary.rect.max_lon': 31.313131
    };
    const res = {};

    const generateQuery = proxyquire('../../../query/address_search_using_ids', {
      'pelias-logger': logger,
      'pelias-query': {
        layout: {
          AddressesUsingIdsQuery: MockQuery
        },
        view: views,
        Vars: require('pelias-query').Vars
      }

    });

    const generatedQuery = generateQuery(clean, res);

    t.equals(generatedQuery.body.vs.var('boundary:rect:top').toString(), 13.131313);
    t.equals(generatedQuery.body.vs.var('boundary:rect:right').toString(), 31.313131);
    t.equals(generatedQuery.body.vs.var('boundary:rect:bottom').toString(), 12.121212);
    t.equals(generatedQuery.body.vs.var('boundary:rect:left').toString(), 21.212121);

    t.end();

  });

  test('boundary circle without radius should set radius to default', (t) => {
    const logger = mock_logger();

    const clean = {
      parsed_text: {
        housenumber: 'housenumber value',
        street: 'street value'
      },
      'boundary.circle.lat': 12.121212,
      'boundary.circle.lon': 21.212121
    };
    const res = {};

    const generateQuery = proxyquire('../../../query/address_search_using_ids', {
      'pelias-logger': logger,
      'pelias-query': {
        layout: {
          AddressesUsingIdsQuery: MockQuery
        },
        view: views,
        Vars: require('pelias-query').Vars
      }

    });

    const generatedQuery = generateQuery(clean, res);

    t.equals(generatedQuery.body.vs.var('boundary:circle:lat').toString(), 12.121212);
    t.equals(generatedQuery.body.vs.var('boundary:circle:lon').toString(), 21.212121);
    t.equals(generatedQuery.body.vs.var('boundary:circle:radius').toString(), '50km');

    t.end();

  });

  test('boundary circle with radius set radius to that value rounded', (t) => {
    const logger = mock_logger();

    const clean = {
      parsed_text: {
        housenumber: 'housenumber value',
        street: 'street value'
      },
      'boundary.circle.lat': 12.121212,
      'boundary.circle.lon': 21.212121,
      'boundary.circle.radius': 17.6
    };
    const res = {};

    const generateQuery = proxyquire('../../../query/address_search_using_ids', {
      'pelias-logger': logger,
      'pelias-query': {
        layout: {
          AddressesUsingIdsQuery: MockQuery
        },
        view: views,
        Vars: require('pelias-query').Vars
      }

    });

    const generatedQuery = generateQuery(clean, res);

    t.equals(generatedQuery.body.vs.var('boundary:circle:lat').toString(), 12.121212);
    t.equals(generatedQuery.body.vs.var('boundary:circle:lon').toString(), 21.212121);
    t.equals(generatedQuery.body.vs.var('boundary:circle:radius').toString(), '18km');

    t.end();

  });

  test('boundary.gid available should add to query', (t) => {
    const logger = mock_logger();

    const clean = {
      parsed_text: {
        housenumber: 'housenumber value',
        street: 'street value'
      },
      'boundary.gid': '123'
    };
    const res = {};

    const generateQuery = proxyquire('../../../query/address_search_using_ids', {
      'pelias-logger': logger,
      'pelias-query': {
        layout: {
          AddressesUsingIdsQuery: MockQuery
        },
        view: views,
        Vars: require('pelias-query').Vars
      }

    });

    const generatedQuery = generateQuery(clean, res);

    t.equals(generatedQuery.body.vs.var('boundary:gid').toString(), '123');

    t.end();

  });

};

module.exports.all = (tape, common) => {
  function test(name, testFunction) {
    return tape(`address_search_using_ids query ${name}`, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
