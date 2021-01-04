const _ = require('lodash');
const VariableStore = require('pelias-query').Vars;
const maxCharFilter = require('../../../../query/view/max_character_count_layer_filter');
const allLayers = require('../../../../helper/type_mapping').layers;

module.exports.tests = {};

module.exports.tests.interface = function(test, common) {
  test('interface: factory', function(t) {
    t.equal(typeof maxCharFilter, 'function', 'valid factory function');
    t.equal(maxCharFilter.length, 2, 'factory takes 2 args');
    t.end();
  });
  test('interface: view', function(t) {
    let view = maxCharFilter(['address'], 1);
    t.equal(typeof view, 'function', 'returns view');
    t.equal(view.length, 1, 'view takes 1 arg');
    t.end();
  });
};

module.exports.tests.factory_missing_required_args = function(test, common) {
  test('excludedLayers undefined', function(t) {
    let view = maxCharFilter(undefined, 1);
    t.equal(view(), null, 'should have returned null');
    t.end();
  });
  test('excludedLayers not array', function(t) {
    let view = maxCharFilter('test', 1);
    t.equal(view(), null, 'should have returned null');
    t.end();
  });
  test('excludedLayers empty', function(t) {
    let view = maxCharFilter([], 1);
    t.equal(view(), null, 'should have returned null');
    t.end();
  });
  test('maxCharCount undefined', function(t) {
    let view = maxCharFilter(['address'], undefined);
    t.equal(view(), null, 'should have returned null');
    t.end();
  });
  test('maxCharCount not number', function(t) {
    let view = maxCharFilter(['address'], '1');
    t.equal(view(), null, 'should have returned null');
    t.end();
  });
  test('maxCharCount is zero', function (t) {
    let view = maxCharFilter(['address'], 0);
    t.equal(view(), null, 'should have returned null');
    t.end();
  });
};

module.exports.tests.view_missing_required_params = function(test, common) {
  test('input:name not set in VariableStore should return null', function(t) {
    let view = maxCharFilter(['address'], 1);
    let vs = new VariableStore();
    t.equal(view(vs), null, 'view_missing_required_params');
    t.end();
  });
};

module.exports.tests.view_within_range = function(test, common) {
  test('text length within range', function(t) {
    let view = maxCharFilter(['address'], 99);
    let vs = new VariableStore();
    vs.var('input:name', 'example text');

    let actual = view(vs);
    let expected = {
      terms: {
        layer: { $: _.difference(allLayers, ['address']) }
      }
    };

    t.deepLooseEqual(actual, expected, 'view_within_range');
    t.end();
  });
};

module.exports.tests.view_exceeds_range = function(test, common) {
  test('text length exceeds range', function(t) {
    let view = maxCharFilter(['address'], 11);
    let vs = new VariableStore();
    vs.var('input:name', 'example text');
    t.equal(view(vs), null, 'view_exceeds_range');
    t.end();
  });
};

module.exports.tests.view_clamp_range_low = function(test, common) {
  test('maxCharCount less than one is equal to one', function(t) {
    let view = maxCharFilter(['address'], -999);
    let vs = new VariableStore();
    vs.var('input:name', 'ex');
    t.equal(view(vs), null, 'should have returned null');
    t.end();
  });
  test('maxCharCount less than one is equal to one', function(t) {
    let view = maxCharFilter(['address'], -999);
    let vs = new VariableStore();
    vs.var('input:name', 'e');

    let actual = view(vs);
    let expected = {
      terms: {
        layer: { $: _.difference(allLayers, ['address']) }
      }
    };
    t.deepLooseEqual(actual, expected, 'view_clamp_range_low');
    t.end();
  });
};

module.exports.all = function (tape, common) {
  function test(name, testFunction) {
    return tape('filter ' + name, testFunction);
  }
  for( let testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
