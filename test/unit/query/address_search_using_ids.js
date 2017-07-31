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
  sources: 'sources view'
};

module.exports.tests.base_query = (test, common) => {
  test('basic', (t) => {
    const logger = mock_logger();

    const clean = {
      parsed_text: {
        number: 'housenumber value',
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

    t.equals(generatedQuery.type, 'fallback');

    t.equals(generatedQuery.body.vs.var('input:housenumber').toString(), 'housenumber value');
    t.equals(generatedQuery.body.vs.var('input:street').toString(), 'street value');
    t.notOk(generatedQuery.body.vs.isset('sources'));
    t.equals(generatedQuery.body.vs.var('size').toString(), 20);

    t.deepEquals(generatedQuery.body.score_functions, [
      'focus_only_function'
    ]);

    t.deepEquals(generatedQuery.body.filter_functions, [
      'boundary_country view',
      'boundary_circle view',
      'boundary_rect view',
      'sources view'
    ]);

    t.deepEquals(logger.getInfoMessages(), ['[query:address_search_using_ids] [parser:libpostal]']);
    t.end();

  });
};

module.exports.tests.other_parameters = (test, common) => {
  test('explicit size set', (t) => {
    const logger = mock_logger();

    const clean = {
      parsed_text: {
        number: 'housenumber value',
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
    t.deepEquals(logger.getInfoMessages(), ['[query:address_search_using_ids] [parser:libpostal] [param:querySize]']);
    t.end();

  });

  test('explicit sources set', (t) => {
    const logger = mock_logger();

    const clean = {
      parsed_text: {
        number: 'housenumber value',
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
    t.deepEquals(logger.getInfoMessages(), ['[query:address_search_using_ids] [parser:libpostal] [param:sources]']);
    t.end();

  });

};

module.exports.tests.granularity_bands = (test, common) => {
  test('neighbourhood/borough/locality/localadmin granularity band', (t) => {
    const logger = mock_logger();

    const clean = {
      parsed_text: {
        number: 'housenumber value',
        street: 'street value'
      }
    };
    const res = {
      data: [
        {
          layer: 'neighbourhood',
          source_id: 1
        },
        {
          layer: 'borough',
          source_id: 2
        },
        {
          layer: 'locality',
          source_id: 3
        },
        {
          layer: 'localadmin',
          source_id: 4
        },
        {
          layer: 'county',
          source_id: 5
        },
        {
          layer: 'macrocounty',
          source_id: 6
        },
        {
          layer: 'region',
          source_id: 7
        },
        {
          layer: 'macroregion',
          source_id: 8
        },
        {
          layer: 'dependency',
          source_id: 9
        },
        {
          layer: 'country',
          source_id: 10
        },
        {
          layer: 'neighbourhood',
          source_id: 11
        },
        {
          layer: 'borough',
          source_id: 12
        },
        {
          layer: 'locality',
          source_id: 13
        },
        {
          layer: 'localadmin',
          source_id: 14
        },
        {
          layer: 'county',
          source_id: 15
        },
        {
          layer: 'macrocounty',
          source_id: 16
        },
        {
          layer: 'region',
          source_id: 17
        },
        {
          layer: 'macroregion',
          source_id: 18
        },
        {
          layer: 'dependency',
          source_id: 19
        },
        {
          layer: 'country',
          source_id: 20
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

    t.deepEquals(generatedQuery.body.vs.var('input:layers').$, {
      neighbourhood: [1, 11],
      borough: [2, 12],
      locality: [3, 13],
      localadmin: [4, 14],
      region: [7, 17],
      macroregion: [8, 18],
      dependency: [9, 19],
      country: [10, 20]
    });

    t.end();
  });

  test('only band members with ids should be passed', (t) => {
    const logger = mock_logger();

    const clean = {
      parsed_text: {
        number: 'housenumber value',
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

    t.deepEquals(generatedQuery.body.vs.var('input:layers').$, {
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
        number: 'housenumber value',
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

    t.deepEquals(generatedQuery.body.vs.var('input:layers').$, {
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
        number: 'housenumber value',
        street: 'street value'
      },
      'boundary.country': 'boundary.country value'
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
        number: 'housenumber value',
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
        number: 'housenumber value',
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
        number: 'housenumber value',
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
        number: 'housenumber value',
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

};

module.exports.all = (tape, common) => {
  function test(name, testFunction) {
    return tape(`address_search_using_ids query ${name}`, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
