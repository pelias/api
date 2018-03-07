'use strict';

const _ = require('lodash');
const has_results_at_layers = require('../../../../controller/predicates/has_results_at_layers');

module.exports.tests = {};

module.exports.tests.interface = (test, common) => {
  test('valid interface', t => {
    t.equal(typeof has_results_at_layers.any(), 'function', 'has_results_at_layers.any is a function');
    t.equal(has_results_at_layers.any.length, 1);
    t.equal(typeof has_results_at_layers.all(), 'function', 'has_results_at_layers.all is a function');
    t.equal(has_results_at_layers.all.length, 1);
    t.end();
  });
};

module.exports.tests.any_true_conditions = (test, common) => {
  test('any: should return true when any result.layer matches any layer in array', t => {
    const req = {};
    const res = {
      data: [
        {
          layer: 'layer 1'
        },
        {
          layer: 'layer 2'
        },
        {
          layer: 'layer 3'
        }
      ]
    };

    t.ok(has_results_at_layers.any(['layer 2', 'layer 4'])(req, res));
    t.end();

  });

  test('any: should return true when any result.layer matches layer string', t => {
    const req = {};
    const res = {
      data: [
        {
          layer: 'layer 1'
        },
        {
          layer: 'layer 2'
        },
        {
          layer: 'layer 3'
        }
      ]
    };

    t.ok(has_results_at_layers.any('layer 2')(req, res));
    t.end();

  });

};

module.exports.tests.any_false_conditions = (test, common) => {
  test('any: should return false when response has undefined data', t => {
    const req = {};
    const res = {};

    t.notOk(has_results_at_layers.any('layer')(req, res));
    t.end();

  });

  test('any: should return false when response has empty data array', t => {
    const req = {};
    const res = {
      data: []
    };

    t.notOk(has_results_at_layers.any('layer')(req, res));
    t.end();

  });

  test('any: should return false when layer is a substring of non-array string layers parameter', t => {
    const req = {};
    const res = {
      data: [
        {
          layer: 'aye'
        }
      ]
    };

    t.notOk(has_results_at_layers.any('layer')(req, res));
    t.end();

  });

  test('any: should return false when no results have layer in supplied layers', t => {
    const req = {};
    const res = {
      data: [
        {
          layer: 'layer 1'
        }
      ]
    };

    t.notOk(has_results_at_layers.any(['layer 2', 'layer 3'])(req, res));
    t.end();

  });

};

module.exports.tests.all_true_conditions = (test, common) => {
  test('all: should return true when all result.layer values are in supplied layers', t => {
    const req = {};
    const res = {
      data: [
        {
          layer: 'layer 1'
        },
        {
          layer: 'layer 2'
        }
      ]
    };

    t.ok(has_results_at_layers.all(['layer 1', 'layer 2', 'layer 4'])(req, res));
    t.end();

  });

};

module.exports.tests.all_false_conditions = (test, common) => {
  test('all: should return true when all result.layer values are in supplied layers', t => {
    const req = {};
    const res = {
      data: [
        {
          layer: 'layer 1'
        },
        {
          layer: 'layer 3'
        }
      ]
    };

    t.notOk(has_results_at_layers.all(['layer 1', 'layer 2'])(req, res));
    t.end();

  });

};

module.exports.all = (tape, common) => {
  function test(name, testFunction) {
    return tape(`GET /has_results_at_layers ${name}`, testFunction);
  }

  for( const testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
