const generateQuery = require('../../../query/venues');
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
  test('neighbourhood from parsed_text should be used for input:query when most granular', t => {
    const clean = {
      parsed_text: {
        neighbourhood: 'neighbourhood value',
        borough: 'borough value',
        city: 'city value',
        county: 'county value',
        state: 'state value',
        country: 'country value'
      }
    };

    const generatedQuery = proxyquire('../../../query/venues', {
      'pelias-query': {
        layout: {
          VenuesQuery: MockQuery
        },
        view: views,
        Vars: require('pelias-query').Vars
      }
    })(clean);

    t.equals(generatedQuery.body.vs.var('input:query').toString(), 'neighbourhood value');
    t.end();

  });

  test('borough from parsed_text should be used for input:query when most granular', t => {
    const clean = {
      parsed_text: {
        borough: 'borough value',
        city: 'city value',
        county: 'county value',
        state: 'state value',
        country: 'country value'
      }
    };

    const generatedQuery = proxyquire('../../../query/venues', {
      'pelias-query': {
        layout: {
          VenuesQuery: MockQuery
        },
        view: views,
        Vars: require('pelias-query').Vars
      }
    })(clean);

    t.equals(generatedQuery.body.vs.var('input:query').toString(), 'borough value');
    t.end();

  });

  test('city from parsed_text should be used for input:query when most granular', t => {
    const clean = {
      parsed_text: {
        city: 'city value',
        county: 'county value',
        state: 'state value',
        country: 'country value'
      }
    };

    const generatedQuery = proxyquire('../../../query/venues', {
      'pelias-query': {
        layout: {
          VenuesQuery: MockQuery
        },
        view: views,
        Vars: require('pelias-query').Vars
      }
    })(clean);

    t.equals(generatedQuery.body.vs.var('input:query').toString(), 'city value');
    t.end();

  });

  test('county from parsed_text should be used for input:query when most granular', t => {
    const clean = {
      parsed_text: {
        county: 'county value',
        state: 'state value',
        country: 'country value'
      }
    };

    const generatedQuery = proxyquire('../../../query/venues', {
      'pelias-query': {
        layout: {
          VenuesQuery: MockQuery
        },
        view: views,
        Vars: require('pelias-query').Vars
      }
    })(clean);

    t.equals(generatedQuery.body.vs.var('input:query').toString(), 'county value');
    t.end();

  });

  test('state from parsed_text should be used for input:query when most granular', t => {
    const clean = {
      parsed_text: {
        state: 'state value',
        country: 'country value'
      }
    };

    const generatedQuery = proxyquire('../../../query/venues', {
      'pelias-query': {
        layout: {
          VenuesQuery: MockQuery
        },
        view: views,
        Vars: require('pelias-query').Vars
      }
    })(clean);

    t.equals(generatedQuery.body.vs.var('input:query').toString(), 'state value');
    t.end();

  });

  test('country from parsed_text should be used for input:query when most granular', t => {
    const clean = {
      parsed_text: {
        country: 'country value'
      }
    };

    const generatedQuery = proxyquire('../../../query/venues', {
      'pelias-query': {
        layout: {
          VenuesQuery: MockQuery
        },
        view: views,
        Vars: require('pelias-query').Vars
      }
    })(clean);

    t.equals(generatedQuery.body.vs.var('input:query').toString(), 'country value');
    t.end();

  });

  test('no input:query should be set when no admin layers in parsed_text', t => {
    const clean = {
      parsed_text: {
      }
    };

    const generatedQuery = proxyquire('../../../query/venues', {
      'pelias-query': {
        layout: {
          VenuesQuery: MockQuery
        },
        view: views,
        Vars: require('pelias-query').Vars
      }
    })(clean);

    t.notOk(generatedQuery.body.vs.isset('input:query'));
    t.end();

  });

  test('scores and filters should be added', t => {
    const logger = mock_logger();

    const clean = {
      parsed_text: {
        city: 'city value'
      }
    };

    const generatedQuery = proxyquire('../../../query/venues', {
      'pelias-logger': logger,
      'pelias-query': {
        layout: {
          VenuesQuery: MockQuery
        },
        view: views,
        Vars: require('pelias-query').Vars
      }
    })(clean);

    t.equals(generatedQuery.type, 'fallback');

    t.equals(generatedQuery.body.vs.var('input:query').toString(), 'city value');
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

    t.deepEquals(logger.getInfoMessages(), ['[query:venues] [parser:libpostal]']);
    t.end();

  });
};

module.exports.tests.other_parameters = (test, common) => {
  test('explicit size set', (t) => {
    const logger = mock_logger();

    const clean = {
      parsed_text: {
        city: 'city value'
      },
      querySize: 'querySize value'
    };

    const generatedQuery = proxyquire('../../../query/venues', {
      'pelias-logger': logger,
      'pelias-query': {
        layout: {
          VenuesQuery: MockQuery
        },
        view: views,
        Vars: require('pelias-query').Vars
      }
    })(clean);

    t.equals(generatedQuery.body.vs.var('size').toString(), 'querySize value');
    t.deepEquals(logger.getInfoMessages(), ['[query:venues] [parser:libpostal] [param:querySize]']);
    t.end();

  });

  test('explicit sources set', (t) => {
    const logger = mock_logger();

    const clean = {
      parsed_text: {
        city: 'city value'
      },
      sources: ['source 1', 'source 2']
    };

    const generatedQuery = proxyquire('../../../query/venues', {
      'pelias-logger': logger,
      'pelias-query': {
        layout: {
          VenuesQuery: MockQuery
        },
        view: views,
        Vars: require('pelias-query').Vars
      }
    })(clean);

    t.deepEquals(generatedQuery.body.vs.var('sources').toString(), ['source 1', 'source 2']);
    t.deepEquals(logger.getInfoMessages(), ['[query:venues] [parser:libpostal] [param:sources]']);
    t.end();

  });

};

module.exports.tests.boundary_filters = (test, common) => {
  test('boundary.country available should add to query', (t) => {
    const logger = mock_logger();

    const clean = {
      parsed_text: {
        city: 'city value'
      },
      'boundary.country': 'boundary.country value'
    };

    const generatedQuery = proxyquire('../../../query/venues', {
      'pelias-logger': logger,
      'pelias-query': {
        layout: {
          VenuesQuery: MockQuery
        },
        view: views,
        Vars: require('pelias-query').Vars
      }
    })(clean);

    t.equals(generatedQuery.body.vs.var('boundary:country').toString(), 'boundary.country value');

    t.end();

  });

  test('focus.point.lat/lon w/both numbers should add to query', (t) => {
    const logger = mock_logger();

    const clean = {
      parsed_text: {
        city: 'city value'
      },
      'focus.point.lat': 12.121212,
      'focus.point.lon': 21.212121
    };

    const generatedQuery = proxyquire('../../../query/venues', {
      'pelias-logger': logger,
      'pelias-query': {
        layout: {
          VenuesQuery: MockQuery
        },
        view: views,
        Vars: require('pelias-query').Vars
      }
    })(clean);

    t.equals(generatedQuery.body.vs.var('focus:point:lat').toString(), 12.121212);
    t.equals(generatedQuery.body.vs.var('focus:point:lon').toString(), 21.212121);

    t.end();

  });

  test('boundary.rect with all numbers should add to query', (t) => {
    const logger = mock_logger();

    const clean = {
      parsed_text: {
        city: 'city value'
      },
      'boundary.rect.min_lat': 12.121212,
      'boundary.rect.max_lat': 13.131313,
      'boundary.rect.min_lon': 21.212121,
      'boundary.rect.max_lon': 31.313131
    };

    const generatedQuery = proxyquire('../../../query/venues', {
      'pelias-logger': logger,
      'pelias-query': {
        layout: {
          VenuesQuery: MockQuery
        },
        view: views,
        Vars: require('pelias-query').Vars
      }
    })(clean);

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
        city: 'city value'
      },
      'boundary.circle.lat': 12.121212,
      'boundary.circle.lon': 21.212121
    };

    const generatedQuery = proxyquire('../../../query/venues', {
      'pelias-logger': logger,
      'pelias-query': {
        layout: {
          VenuesQuery: MockQuery
        },
        view: views,
        Vars: require('pelias-query').Vars
      }
    })(clean);

    t.equals(generatedQuery.body.vs.var('boundary:circle:lat').toString(), 12.121212);
    t.equals(generatedQuery.body.vs.var('boundary:circle:lon').toString(), 21.212121);
    t.equals(generatedQuery.body.vs.var('boundary:circle:radius').toString(), '50km');

    t.end();

  });

  test('boundary circle with radius set radius to that value rounded', (t) => {
    const logger = mock_logger();

    const clean = {
      parsed_text: {
        city: 'city value'
      },
      'boundary.circle.lat': 12.121212,
      'boundary.circle.lon': 21.212121,
      'boundary.circle.radius': 17.6
    };

    const generatedQuery = proxyquire('../../../query/venues', {
      'pelias-logger': logger,
      'pelias-query': {
        layout: {
          VenuesQuery: MockQuery
        },
        view: views,
        Vars: require('pelias-query').Vars
      }
    })(clean);

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
