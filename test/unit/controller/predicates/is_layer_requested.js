'use strict';

const _ = require('lodash');
const is_layer_requested = require('../../../../controller/predicates/is_layer_requested');
const all_layers = require('../../../../helper/type_mapping').layers;

module.exports.tests = {};

module.exports.tests.interface = (test, common) => {
  test('valid interface', t => {
    t.equal(typeof is_layer_requested, 'function', 'is_layer_requested is a function');
    t.end();
  });
};

module.exports.tests.false_conditions = (test, common) => {
  test('request with empty layers should return false', t => {
    const is_venue_requested = is_layer_requested('venue');

    const req = {
      clean: {
        layers: []
      }
    };

    t.notOk(is_venue_requested(req));
    t.end();

  });

  test('request with layers just "address" or "venue" return false', t => {
    const is_venue_requested = is_layer_requested('venue');

    _.without(all_layers, 'venue').forEach(non_venue_layer => {
      const req = {
        clean: {
          layers: [non_venue_layer]
        }
      };

      t.notOk(is_venue_requested(req));

    });

    t.end();

  });

};

module.exports.tests.true_conditions = (test, common) => {
  test('undefined layers should return true since all layers are implied', t => {
    const req = {
      clean: {}
    };

    t.ok(is_layer_requested(req));
    t.end();

  });

  test('layers with venue and any others should return true', t => {
    const is_venue_requested = is_layer_requested('venue');

    _.without(all_layers, 'venue').forEach(non_venue_layer => {
      const req = {
        clean: {
          layers: [non_venue_layer, 'venue']
        }
      };

      t.ok(is_layer_requested(req));

    });

    t.end();

  });

  test('layers with locality and any others should return true', t => {
    // this test shows that predicate isn't venue-specific since all other tests use venue
    const is_venue_requested = is_layer_requested('locality');

    _.without(all_layers, 'locality').forEach(non_locality_layer => {
      const req = {
        clean: {
          layers: [non_locality_layer, 'venue']
        }
      };

      t.ok(is_layer_requested(req));

    });

    t.end();

  });

};

module.exports.all = (tape, common) => {
  function test(name, testFunction) {
    return tape(`GET /is_layer_requested ${name}`, testFunction);
  }

  for( const testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
