const generate = require('../../../query/reverse');
const _ = require('lodash');
const proxyquire = require('proxyquire').noCallThru();
const MockQuery = require('./MockQuery');

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

module.exports.all = function (tape, common) {
  function test(name, testFunction) {
    return tape('reverse query ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
