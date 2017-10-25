const generate = require('../../../query/reverse');
const _ = require('lodash');
const proxyquire = require('proxyquire').noCallThru();
const MockQuery = require('./MockQuery');
const all_layers = require('../../../helper/type_mapping').layers;

// helper for canned views
const views = {
  boundary_country: 'boundary_country view',
  boundary_circle: 'boundary_circle view',
  sources: 'sources view',
  layers: 'layers view',
  categories: 'categories view',
  sort_distance: 'sort_distance view'
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
    const clean = {};

    const query = proxyquire('../../../query/reverse', {
      'pelias-query': {
        layout: {
          FilteredBooleanQuery: MockQuery
        },
        view: views,
        Vars: require('pelias-query').Vars
      },
      './reverse_defaults': {
        default_parameter_1: 'first default parameter',
        default_parameter_2: 'second default parameter'
      }
    })(clean);

    t.equals(query.type, 'reverse', 'query type set');
    t.deepEquals(query.body.vs.var('default_parameter_1').toString(), 'first default parameter');
    t.deepEquals(query.body.vs.var('default_parameter_2').toString(), 'second default parameter');
    t.notOk(query.body.vs.isset('size'));
    t.notOk(query.body.vs.isset('sources'));
    t.notOk(query.body.vs.isset('layers'));
    t.notOk(query.body.vs.isset('focus:point:lat'));
    t.notOk(query.body.vs.isset('focus:point:lon'));
    t.notOk(query.body.vs.isset('boundary:circle:lat'));
    t.notOk(query.body.vs.isset('boundary:circle:lon'));
    t.notOk(query.body.vs.isset('boundary:circle:radius'));
    t.notOk(query.body.vs.isset('boundary:country'));
    t.notOk(query.body.vs.isset('input:categories'));

    t.deepEquals(query.body.score_functions, [
      'boundary_country view'
    ]);

    t.deepEquals(query.body.filter_functions, [
      'boundary_circle view',
      'sources view',
      'layers view',
      'categories view'
    ]);

    t.deepEquals(query.body.sort_functions, [
      'sort_distance view'
    ]);

    t.end();

  });

  test('clean.querySize should set size parameter', t => {
    const clean = {
      querySize: 17
    };

    const query = proxyquire('../../../query/reverse', {
      'pelias-query': {
        layout: {
          FilteredBooleanQuery: MockQuery
        },
        view: views,
        Vars: require('pelias-query').Vars
      },
      './reverse_defaults': {}
    })(clean);

    t.deepEquals(query.body.vs.var('size').toString(), 17);
    t.end();

  });

};

module.exports.tests.sources = (test, common) => {
  test('non-array clean.sources should not set sources in vs', t => {
    const clean = {
      sources: 'this is not an array'
    };

    const query = proxyquire('../../../query/reverse', {
      'pelias-query': {
        layout: {
          FilteredBooleanQuery: MockQuery
        },
        view: views,
        Vars: require('pelias-query').Vars
      },
      './reverse_defaults': {}
    })(clean);

    t.notOk(query.body.vs.isset('sources'));
    t.end();

  });

  test('empty array clean.sources should not set sources in vs', t => {
    const clean = {
      sources: []
    };

    const query = proxyquire('../../../query/reverse', {
      'pelias-query': {
        layout: {
          FilteredBooleanQuery: MockQuery
        },
        view: views,
        Vars: require('pelias-query').Vars
      },
      './reverse_defaults': {}
    })(clean);

    t.notOk(query.body.vs.isset('sources'));
    t.end();

  });

  test('non-empty array clean.sources should set sources in vs', t => {
    const clean = {
      sources: ['source 1', 'source 2']
    };

    const query = proxyquire('../../../query/reverse', {
      'pelias-query': {
        layout: {
          FilteredBooleanQuery: MockQuery
        },
        view: views,
        Vars: require('pelias-query').Vars
      },
      './reverse_defaults': {}
    })(clean);

    t.deepEquals(query.body.vs.var('sources').toString(), ['source 1', 'source 2']);
    t.end();

  });

};

module.exports.tests.layers = (test, common) => {
  test('non-array clean.layers should not set sources in vs', t => {
    const clean = {
      layers: 'this is not an array'
    };

    const query = proxyquire('../../../query/reverse', {
      'pelias-query': {
        layout: {
          FilteredBooleanQuery: MockQuery
        },
        view: views,
        Vars: require('pelias-query').Vars
      },
      './reverse_defaults': {}
    })(clean);

    t.notOk(query.body.vs.isset('layers'));
    t.end();

  });

  test('empty array clean.layers should not set sources in vs', t => {
    const clean = {
      layers: []
    };

    const query = proxyquire('../../../query/reverse', {
      'pelias-query': {
        layout: {
          FilteredBooleanQuery: MockQuery
        },
        view: views,
        Vars: require('pelias-query').Vars
      },
      './reverse_defaults': {}
    })(clean);

    t.notOk(query.body.vs.isset('layers'));
    t.end();

  });

  test('non-empty array clean.layers should only set non-coarse layers in vs', t => {
    const clean = {
      layers: all_layers
    };

    const query = proxyquire('../../../query/reverse', {
      'pelias-query': {
        layout: {
          FilteredBooleanQuery: MockQuery
        },
        view: views,
        Vars: require('pelias-query').Vars
      },
      './reverse_defaults': {}
    })(clean);

    t.deepEquals(query.body.vs.var('layers').toString(), ['address', 'venue', 'street']);
    t.end();

  });

};

module.exports.tests.focus_point = (test, common) => {
  test('numeric point.lat and non-numeric point.lon should not add focus:point:* fields', t => {
    const clean = {
      'point.lat': 12.121212,
      'point.lon': 'this is non-numeric'
    };

    const query = proxyquire('../../../query/reverse', {
      'pelias-query': {
        layout: {
          FilteredBooleanQuery: MockQuery
        },
        view: views,
        Vars: require('pelias-query').Vars
      },
      './reverse_defaults': {}
    })(clean);

    t.notOk(query.body.vs.isset('focus:point:lat'));
    t.notOk(query.body.vs.isset('focus:point:lon'));
    t.end();

  });

  test('non-numeric point.lat and numeric point.lon should not add focus:point:* fields', t => {
    const clean = {
      'point.lat': 'this is non-numeric',
      'point.lon': 21.212121
    };

    const query = proxyquire('../../../query/reverse', {
      'pelias-query': {
        layout: {
          FilteredBooleanQuery: MockQuery
        },
        view: views,
        Vars: require('pelias-query').Vars
      },
      './reverse_defaults': {}
    })(clean);

    t.notOk(query.body.vs.isset('focus:point:lat'));
    t.notOk(query.body.vs.isset('focus:point:lon'));
    t.end();

  });

  test('numeric point.lat and point.lon should add focus:point:* fields', t => {
    const clean = {
      'point.lat': 12.121212,
      'point.lon': 21.212121
    };

    const query = proxyquire('../../../query/reverse', {
      'pelias-query': {
        layout: {
          FilteredBooleanQuery: MockQuery
        },
        view: views,
        Vars: require('pelias-query').Vars
      },
      './reverse_defaults': {}
    })(clean);

    t.deepEquals(query.body.vs.var('focus:point:lat').toString(), 12.121212);
    t.deepEquals(query.body.vs.var('focus:point:lon').toString(), 21.212121);
    t.end();

  });

};

module.exports.tests.boundary_circle = (test, common) => {
  test('numeric lat and non-numeric lon should not add boundary:circle:* fields', t => {
    const clean = {
      'boundary.circle.lat': 12.121212,
      'boundary.circle.lon': 'this is non-numeric'
    };

    const query = proxyquire('../../../query/reverse', {
      'pelias-query': {
        layout: {
          FilteredBooleanQuery: MockQuery
        },
        view: views,
        Vars: require('pelias-query').Vars
      },
      './reverse_defaults': {}
    })(clean);

    t.notOk(query.body.vs.isset('boundary:circle:lat'));
    t.notOk(query.body.vs.isset('boundary:circle:lon'));
    t.notOk(query.body.vs.isset('boundary:circle:radius'));
    t.end();

  });

  test('non-numeric lat and numeric lon should not add boundary:circle:* fields', t => {
    const clean = {
      'boundary.circle.lat': 'this is non-numeric',
      'boundary.circle.lon': 21.212121
    };

    const query = proxyquire('../../../query/reverse', {
      'pelias-query': {
        layout: {
          FilteredBooleanQuery: MockQuery
        },
        view: views,
        Vars: require('pelias-query').Vars
      },
      './reverse_defaults': {}
    })(clean);

    t.notOk(query.body.vs.isset('boundary:circle:lat'));
    t.notOk(query.body.vs.isset('boundary:circle:lon'));
    t.notOk(query.body.vs.isset('boundary:circle:radius'));
    t.end();

  });

  test('radius not supplied should default to value from reverse_defaults', t => {
    const clean = {
      'boundary.circle.lat': 12.121212,
      'boundary.circle.lon': 21.212121
    };

    const query = proxyquire('../../../query/reverse', {
      'pelias-query': {
        layout: {
          FilteredBooleanQuery: MockQuery
        },
        view: views,
        Vars: require('pelias-query').Vars
      },
      './reverse_defaults': {
        'boundary:circle:radius': 17
      }
    })(clean);

    t.deepEquals(query.body.vs.var('boundary:circle:lat').toString(), 12.121212);
    t.deepEquals(query.body.vs.var('boundary:circle:lon').toString(), 21.212121);
    t.deepEquals(query.body.vs.var('boundary:circle:radius').toString(), 17);
    t.end();

  });

  test('numeric radius supplied should be used instead of value from reverse_defaults', t => {
    const clean = {
      'boundary.circle.lat': 12.121212,
      'boundary.circle.lon': 21.212121,
      'boundary.circle.radius': 17
    };

    const query = proxyquire('../../../query/reverse', {
      'pelias-query': {
        layout: {
          FilteredBooleanQuery: MockQuery
        },
        view: views,
        Vars: require('pelias-query').Vars
      },
      './reverse_defaults': {
        'boundary:circle:radius': 18
      }
    })(clean);

    t.deepEquals(query.body.vs.var('boundary:circle:lat').toString(), 12.121212);
    t.deepEquals(query.body.vs.var('boundary:circle:lon').toString(), 21.212121);
    t.deepEquals(query.body.vs.var('boundary:circle:radius').toString(), '17km');
    t.end();

  });

  test('non-numeric radius supplied should not set any boundary:circle:radius', t => {
    const clean = {
      'boundary.circle.lat': 12.121212,
      'boundary.circle.lon': 21.212121,
      'boundary.circle.radius': 'this is non-numeric'
    };

    const query = proxyquire('../../../query/reverse', {
      'pelias-query': {
        layout: {
          FilteredBooleanQuery: MockQuery
        },
        view: views,
        Vars: require('pelias-query').Vars
      },
      './reverse_defaults': {
        'boundary:circle:radius': 18
      }
    })(clean);

    t.deepEquals(query.body.vs.var('boundary:circle:lat').toString(), 12.121212);
    t.deepEquals(query.body.vs.var('boundary:circle:lon').toString(), 21.212121);
    t.deepEquals(query.body.vs.var('boundary:circle:radius').toString(), 18);
    t.end();

  });

};

module.exports.tests.boundary_country = (test, common) => {
  test('non-string boundary.country should not set boundary:country', t => {
    [17, undefined, {}, [], true, null].forEach(value => {
      const clean = {
        'boundary.country': value
      };

      const query = proxyquire('../../../query/reverse', {
        'pelias-query': {
          layout: {
            FilteredBooleanQuery: MockQuery
          },
          view: views,
          Vars: require('pelias-query').Vars
        },
        './reverse_defaults': {}
      })(clean);

      t.notOk(query.body.vs.isset('boundary:country'));
    });

    t.end();

  });

  test('string boundary.country should set boundary:country', t => {
    const clean = {
      'boundary.country': 'boundary country value'
    };

    const query = proxyquire('../../../query/reverse', {
      'pelias-query': {
        layout: {
          FilteredBooleanQuery: MockQuery
        },
        view: views,
        Vars: require('pelias-query').Vars
      },
      './reverse_defaults': {}
    })(clean);

    t.deepEquals(query.body.vs.var('boundary:country').toString(), 'boundary country value');
    t.end();

  });

};

module.exports.tests.categories = (test, common) => {
  test('categories supplied should set input:categories', t => {
    const clean = {
      categories: 'categories value'
    };

    const query = proxyquire('../../../query/reverse', {
      'pelias-query': {
        layout: {
          FilteredBooleanQuery: MockQuery
        },
        view: views,
        Vars: require('pelias-query').Vars
      },
      './reverse_defaults': {}
    })(clean);

    t.deepEquals(query.body.vs.var('input:categories').toString(), 'categories value');
    t.end();

  });

};

module.exports.all = function (tape, common) {
  function test(name, testFunction) {
    return tape('reverse query ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
