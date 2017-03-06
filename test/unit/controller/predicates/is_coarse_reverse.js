'use strict';

const _ = require('lodash');
const is_coarse_reverse = require('../../../../controller/predicates/is_coarse_reverse');

const coarse_layers = [
  'continent',
  'country',
  'dependency',
  'macroregion',
  'region',
  'locality',
  'localadmin',
  'macrocounty',
  'county',
  'macrohood',
  'borough',
  'neighbourhood',
  'microhood',
  'disputed'
];

module.exports.tests = {};

module.exports.tests.interface = (test, common) => {
  test('valid interface', (t) => {
    t.equal(typeof is_coarse_reverse, 'function', 'is_coarse_reverse is a function');
    t.end();
  });
};

module.exports.tests.false_conditions = (test, common) => {
  test('request without layers should return false', (t) => {
    const req = {
      clean: {}
    };

    t.notOk(is_coarse_reverse(req));
    t.end();

  });

  test('request with empty layers should return false', (t) => {
    const req = {
      clean: {
        layers: []
      }
    };

    t.notOk(is_coarse_reverse(req));
    t.end();

  });

  test('request with layers just "address" or "venue" return false', (t) => {
    ['address', 'venue'].forEach((non_coarse_layer) => {
      const req = {
        clean: {
          layers: [non_coarse_layer]
        }
      };

      t.notOk(is_coarse_reverse(req));

    });

    t.end();

  });

  test('request with layers containing "address" or "venue" and a coarse layer should return false', (t) => {
    ['address', 'venue'].forEach((non_coarse_layer) => {
      const req = {
        clean: {
          layers: [_.sample(coarse_layers), non_coarse_layer]
        }
      };

      t.notOk(is_coarse_reverse(req));

    });

    t.end();

  });

  test('request with layers containing "address" and "venue" should return false', (t) => {
    const req = {
      clean: {
        layers: ['address', 'venue']
      }
    };

    t.notOk(is_coarse_reverse(req));
    t.end();

  });

};

module.exports.tests.true_conditions = (test, common) => {
  test('request with non-empty layers and not containing "address" or "venue" should return true', (t) => {
    coarse_layers.forEach((coarse_layer) => {
      const req = {
        clean: {
          layers: [coarse_layer]
        }
      };

      t.ok(is_coarse_reverse(req));

    });

    t.end();

  });

};

module.exports.all = (tape, common) => {
  function test(name, testFunction) {
    return tape(`GET /is_coarse_reverse ${name}`, testFunction);
  }

  for( const testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
