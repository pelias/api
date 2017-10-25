const generate = require('../../../query/structured_geocoding');
const _ = require('lodash');
const proxyquire = require('proxyquire').noCallThru();
const MockQuery = require('./MockQuery');

// helper for canned views
const views = {
  focus_only_function: () => 'focus_only_function view',
  popularity_only_function: 'popularity_only_function view',
  population_only_function: 'population_only_function view',
  boundary_country: 'boundary_country view',
  boundary_circle: 'boundary_circle view',
  boundary_rect: 'boundary_rect view',
  sources: 'sources view',
  layers: 'layers view',
  categories: 'categories view'
};

module.exports.tests = {};

module.exports.tests.interface = (test, common) => {
  test('valid interface', t => {
    t.equal(typeof generate, 'function', 'valid function');
    t.end();
  });
};

module.exports.tests.query = (test, common) => {
  test('base no frills', t => {
    const clean = {
      text: 'text value',
      sources: 'sources value',
      layers: 'layers value'
    };

    const query = proxyquire('../../../query/structured_geocoding', {
      'pelias-query': {
        layout: {
          StructuredFallbackQuery: MockQuery
        },
        view: views,
        Vars: require('pelias-query').Vars
      },
      './search_defaults': {
        default_parameter_1: 'first default parameter',
        default_parameter_2: 'second default parameter'
      },
      './text_parser': () => {
        t.fail('text_parser should not have been called');
      }
    })(clean);

    t.equals(query.type, 'fallback', 'query type set');
    t.equals(query.body.vs.var('input:name').toString(), 'text value');
    t.equals(query.body.vs.var('sources').toString(), 'sources value');
    t.equals(query.body.vs.var('layers').toString(), 'layers value');
    t.deepEquals(query.body.vs.var('default_parameter_1').toString(), 'first default parameter');
    t.deepEquals(query.body.vs.var('default_parameter_2').toString(), 'second default parameter');
    t.notOk(query.body.vs.isset('size'));
    t.notOk(query.body.vs.isset('focus:point:lat'));
    t.notOk(query.body.vs.isset('focus:point:lon'));
    t.notOk(query.body.vs.isset('boundary:rect:top'));
    t.notOk(query.body.vs.isset('boundary:rect:right'));
    t.notOk(query.body.vs.isset('boundary:rect:bottom'));
    t.notOk(query.body.vs.isset('boundary:rect:left'));
    t.notOk(query.body.vs.isset('boundary:circle:lat'));
    t.notOk(query.body.vs.isset('boundary:circle:lon'));
    t.notOk(query.body.vs.isset('boundary:circle:radius'));
    t.notOk(query.body.vs.isset('boundary:country'));

    t.deepEquals(query.body.score_functions, [
      'focus_only_function view',
      'popularity_only_function view',
      'population_only_function view'
    ]);

    t.deepEquals(query.body.filter_functions, [
      'boundary_country view',
      'boundary_circle view',
      'boundary_rect view',
      'sources view',
      'layers view',
      'categories view'
    ]);

    t.end();
  });

  test('clean.parsed_text and vs should be passed to textParser', t => {
    const clean = {
      text: 'text value',
      sources: 'sources value',
      layers: 'layers value',
      parsed_text: 'parsed_text value'
    };

    const query = proxyquire('../../../query/structured_geocoding', {
      'pelias-query': {
        layout: {
          StructuredFallbackQuery: MockQuery
        },
        view: views,
        Vars: require('pelias-query').Vars
      },
      './search_defaults': {
        default_parameter_1: 'first default parameter',
        default_parameter_2: 'second default parameter'
      },
      './text_parser': (parsed_text, vs) => {
        vs.var('text_parser:value', 'this value populated by text_parser');
      }
    })(clean);

    t.deepEquals(query.body.vs.var('text_parser:value').toString(), 'this value populated by text_parser');
    t.end();

  });

};

module.exports.tests.query_size = (test, common) => {
  test('size should be set when querySize is available', t => {
    const clean = {
      text: 'text value',
      sources: 'sources value',
      layers: 'layers value',
      querySize: 17
    };

    const query = proxyquire('../../../query/structured_geocoding', {
      'pelias-query': {
        layout: {
          StructuredFallbackQuery: MockQuery
        },
        view: views,
        Vars: require('pelias-query').Vars
      },
      './search_defaults': { },
      './text_parser': () => {
        t.fail('text_parser should not have been called');
      }
    })(clean);

    t.equals(query.body.vs.var('size').toString(), 17);

    t.end();

  });

};

module.exports.tests.focus_point_lat_lon = (test, common) => {
  test('missing focus.point.lat shouldn\'t set focus:point:lat/lon', t => {
    const clean = {
      text: 'text value',
      sources: 'sources value',
      layers: 'layers value',
      'focus.point.lon': 21.212121
    };

    const query = proxyquire('../../../query/structured_geocoding', {
      'pelias-query': {
        layout: {
          StructuredFallbackQuery: MockQuery
        },
        view: views,
        Vars: require('pelias-query').Vars
      },
      './search_defaults': { },
      './text_parser': () => {
        t.fail('text_parser should not have been called');
      }
    })(clean);

    t.notOk(query.body.vs.isset('focus:point:lat'));
    t.notOk(query.body.vs.isset('focus:point:lon'));

    t.end();

  });

  test('missing focus.point.lon shouldn\'t set focus:point:lat/lon', t => {
    const clean = {
      text: 'text value',
      sources: 'sources value',
      layers: 'layers value',
      'focus.point.lat': 12.121212
    };

    const query = proxyquire('../../../query/structured_geocoding', {
      'pelias-query': {
        layout: {
          StructuredFallbackQuery: MockQuery
        },
        view: views,
        Vars: require('pelias-query').Vars
      },
      './search_defaults': { },
      './text_parser': () => {
        t.fail('text_parser should not have been called');
      }
    })(clean);

    t.notOk(query.body.vs.isset('focus:point:lat'));
    t.notOk(query.body.vs.isset('focus:point:lon'));

    t.end();

  });

  test('focus.point.lat/lon should set focus:point:lat/lon', t => {
    const clean = {
      text: 'text value',
      sources: 'sources value',
      layers: 'layers value',
      'focus.point.lat': 12.121212,
      'focus.point.lon': 21.212121
    };

    const query = proxyquire('../../../query/structured_geocoding', {
      'pelias-query': {
        layout: {
          StructuredFallbackQuery: MockQuery
        },
        view: views,
        Vars: require('pelias-query').Vars
      },
      './search_defaults': { },
      './text_parser': () => {
        t.fail('text_parser should not have been called');
      }
    })(clean);

    t.equals(query.body.vs.var('focus:point:lat').toString(), 12.121212);
    t.equals(query.body.vs.var('focus:point:lon').toString(), 21.212121);

    t.end();

  });

};

module.exports.tests.boundary_rect = (test, common) => {
  test('missing boundary.rect.min_lat shouldn\'t set boundary:rect fields', t => {
    const clean = {
      text: 'text value',
      sources: 'sources value',
      layers: 'layers value',
      'boundary.rect.max_lat': 13.131313,
      'boundary.rect.min_lon': 21.212121,
      'boundary.rect.max_lon': 31.313131
    };

    const query = proxyquire('../../../query/structured_geocoding', {
      'pelias-query': {
        layout: {
          StructuredFallbackQuery: MockQuery
        },
        view: views,
        Vars: require('pelias-query').Vars
      },
      './search_defaults': { },
      './text_parser': () => {
        t.fail('text_parser should not have been called');
      }
    })(clean);

    t.notOk(query.body.vs.isset('boundary:rect:top'));
    t.notOk(query.body.vs.isset('boundary:rect:right'));
    t.notOk(query.body.vs.isset('boundary:rect:bottom'));
    t.notOk(query.body.vs.isset('boundary:rect:left'));

    t.end();

  });

  test('missing boundary.rect.max_lat shouldn\'t set boundary:rect fields', t => {
    const clean = {
      text: 'text value',
      sources: 'sources value',
      layers: 'layers value',
      'boundary.rect.min_lat': 12.121212,
      'boundary.rect.min_lon': 21.212121,
      'boundary.rect.max_lon': 31.313131
    };

    const query = proxyquire('../../../query/structured_geocoding', {
      'pelias-query': {
        layout: {
          StructuredFallbackQuery: MockQuery
        },
        view: views,
        Vars: require('pelias-query').Vars
      },
      './search_defaults': { },
      './text_parser': () => {
        t.fail('text_parser should not have been called');
      }
    })(clean);

    t.notOk(query.body.vs.isset('boundary:rect:top'));
    t.notOk(query.body.vs.isset('boundary:rect:right'));
    t.notOk(query.body.vs.isset('boundary:rect:bottom'));
    t.notOk(query.body.vs.isset('boundary:rect:left'));

    t.end();

  });

  test('missing boundary.rect.min_lon shouldn\'t set boundary:rect fields', t => {
    const clean = {
      text: 'text value',
      sources: 'sources value',
      layers: 'layers value',
      'boundary.rect.min_lat': 12.121212,
      'boundary.rect.max_lat': 13.131313,
      'boundary.rect.max_lon': 31.313131
    };

    const query = proxyquire('../../../query/structured_geocoding', {
      'pelias-query': {
        layout: {
          StructuredFallbackQuery: MockQuery
        },
        view: views,
        Vars: require('pelias-query').Vars
      },
      './search_defaults': { },
      './text_parser': () => {
        t.fail('text_parser should not have been called');
      }
    })(clean);

    t.notOk(query.body.vs.isset('boundary:rect:top'));
    t.notOk(query.body.vs.isset('boundary:rect:right'));
    t.notOk(query.body.vs.isset('boundary:rect:bottom'));
    t.notOk(query.body.vs.isset('boundary:rect:left'));

    t.end();

  });

  test('missing boundary.rect.max_lon shouldn\'t set boundary:rect fields', t => {
    const clean = {
      text: 'text value',
      sources: 'sources value',
      layers: 'layers value',
      'boundary.rect.min_lat': 12.121212,
      'boundary.rect.max_lat': 13.131313,
      'boundary.rect.min_lon': 21.212121
    };

    const query = proxyquire('../../../query/structured_geocoding', {
      'pelias-query': {
        layout: {
          StructuredFallbackQuery: MockQuery
        },
        view: views,
        Vars: require('pelias-query').Vars
      },
      './search_defaults': { },
      './text_parser': () => {
        t.fail('text_parser should not have been called');
      }
    })(clean);

    t.notOk(query.body.vs.isset('boundary:rect:top'));
    t.notOk(query.body.vs.isset('boundary:rect:right'));
    t.notOk(query.body.vs.isset('boundary:rect:bottom'));
    t.notOk(query.body.vs.isset('boundary:rect:left'));

    t.end();

  });

  test('focus.point.lat/lon should set focus:point:lat/lon', t => {
    const clean = {
      text: 'text value',
      sources: 'sources value',
      layers: 'layers value',
      'boundary.rect.min_lat': 12.121212,
      'boundary.rect.max_lat': 13.131313,
      'boundary.rect.min_lon': 21.212121,
      'boundary.rect.max_lon': 31.313131
    };

    const query = proxyquire('../../../query/structured_geocoding', {
      'pelias-query': {
        layout: {
          StructuredFallbackQuery: MockQuery
        },
        view: views,
        Vars: require('pelias-query').Vars
      },
      './search_defaults': { },
      './text_parser': () => {
        t.fail('text_parser should not have been called');
      }
    })(clean);

    t.equals(query.body.vs.var('boundary:rect:top').toString(), 13.131313);
    t.equals(query.body.vs.var('boundary:rect:right').toString(), 31.313131);
    t.equals(query.body.vs.var('boundary:rect:bottom').toString(), 12.121212);
    t.equals(query.body.vs.var('boundary:rect:left').toString(), 21.212121);

    t.end();

  });

};

module.exports.tests.boundary_circle = (test, common) => {
  test('missing boundary.circle.lat shouldn\'t set boundary:circle fields', t => {
    const clean = {
      text: 'text value',
      sources: 'sources value',
      layers: 'layers value',
      'boundary.circle.lon': 21.212121,
      'boundary.circle.radius': 17
    };

    const query = proxyquire('../../../query/structured_geocoding', {
      'pelias-query': {
        layout: {
          StructuredFallbackQuery: MockQuery
        },
        view: views,
        Vars: require('pelias-query').Vars
      },
      './search_defaults': { },
      './text_parser': () => {
        t.fail('text_parser should not have been called');
      }
    })(clean);

    t.notOk(query.body.vs.isset('boundary:circle:lat'));
    t.notOk(query.body.vs.isset('boundary:circle:lon'));
    t.notOk(query.body.vs.isset('boundary:circle:radius'));

    t.end();

  });

  test('missing boundary.circle.lon shouldn\'t set boundary:circle fields', t => {
    const clean = {
      text: 'text value',
      sources: 'sources value',
      layers: 'layers value',
      'boundary.circle.lat': 12.121212,
      'boundary.circle.radius': 17
    };

    const query = proxyquire('../../../query/structured_geocoding', {
      'pelias-query': {
        layout: {
          StructuredFallbackQuery: MockQuery
        },
        view: views,
        Vars: require('pelias-query').Vars
      },
      './search_defaults': { },
      './text_parser': () => {
        t.fail('text_parser should not have been called');
      }
    })(clean);

    t.notOk(query.body.vs.isset('boundary:circle:lat'));
    t.notOk(query.body.vs.isset('boundary:circle:lon'));
    t.notOk(query.body.vs.isset('boundary:circle:radius'));

    t.end();

  });

  test('missing boundary.circle.radius should set lat/lon but not radius', t => {
    const clean = {
      text: 'text value',
      sources: 'sources value',
      layers: 'layers value',
      'boundary.circle.lat': 12.121212,
      'boundary.circle.lon': 21.212121
    };

    const query = proxyquire('../../../query/structured_geocoding', {
      'pelias-query': {
        layout: {
          StructuredFallbackQuery: MockQuery
        },
        view: views,
        Vars: require('pelias-query').Vars
      },
      './search_defaults': { },
      './text_parser': () => {
        t.fail('text_parser should not have been called');
      }
    })(clean);

    t.equals(query.body.vs.var('boundary:circle:lat').toString(), 12.121212);
    t.equals(query.body.vs.var('boundary:circle:lon').toString(), 21.212121);
    t.notOk(query.body.vs.isset('boundary:circle:radius'));

    t.end();

  });

  test('boundary.circle.* should set lat/lon/radius with last rounded and in kilometers', t => {
    const clean = {
      text: 'text value',
      sources: 'sources value',
      layers: 'layers value',
      'boundary.circle.lat': 12.121212,
      'boundary.circle.lon': 21.212121,
      'boundary.circle.radius': 17.5
    };

    const query = proxyquire('../../../query/structured_geocoding', {
      'pelias-query': {
        layout: {
          StructuredFallbackQuery: MockQuery
        },
        view: views,
        Vars: require('pelias-query').Vars
      },
      './search_defaults': { },
      './text_parser': () => {
        t.fail('text_parser should not have been called');
      }
    })(clean);

    t.equals(query.body.vs.var('boundary:circle:lat').toString(), 12.121212);
    t.equals(query.body.vs.var('boundary:circle:lon').toString(), 21.212121);
    t.equals(query.body.vs.var('boundary:circle:radius').toString(), '18km');

    t.end();

  });

  test('missing boundary.circle.lat/lon but existing boundary.circle.radius should not set any', t => {
    const clean = {
      text: 'text value',
      sources: 'sources value',
      layers: 'layers value',
      'boundary.circle.radius': 17
    };

    const query = proxyquire('../../../query/structured_geocoding', {
      'pelias-query': {
        layout: {
          StructuredFallbackQuery: MockQuery
        },
        view: views,
        Vars: require('pelias-query').Vars
      },
      './search_defaults': { },
      './text_parser': () => {
        t.fail('text_parser should not have been called');
      }
    })(clean);

    t.notOk(query.body.vs.isset('boundary:circle:lat'));
    t.notOk(query.body.vs.isset('boundary:circle:lon'));
    t.notOk(query.body.vs.isset('boundary:circle:radius'));

    t.end();

  });

};

module.exports.tests.boundary_country = (test, common) => {
  test('boundary.country available shoul set boundary:country', t => {
    const clean = {
      text: 'text value',
      sources: 'sources value',
      layers: 'layers value',
      'boundary.country': 'boundary country value'
    };

    const query = proxyquire('../../../query/structured_geocoding', {
      'pelias-query': {
        layout: {
          StructuredFallbackQuery: MockQuery
        },
        view: views,
        Vars: require('pelias-query').Vars
      },
      './search_defaults': { },
      './text_parser': () => {
        t.fail('text_parser should not have been called');
      }
    })(clean);

    t.equals(query.body.vs.var('boundary:country').toString(), 'boundary country value');

    t.end();

  });

};

module.exports.all = (tape, common) => {
  function test(name, testFunction) {
    return tape(`structured_geocoding query ${name}`, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
