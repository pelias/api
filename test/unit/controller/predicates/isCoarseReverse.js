const _ = require('lodash');
const isCoarseReverse = require('../../../../controller/predicates/isCoarseReverse');

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
  'disputed',
  'ocean',
  'marinearea'
];

module.exports.tests = {};

module.exports.tests.interface = (test, common) => {
  test('valid interface', (t) => {
    t.equal(typeof isCoarseReverse, 'function', 'isCoarseReverse is a function');
    t.end();
  });
};

module.exports.tests.false_conditions = (test, common) => {
  test('request without layers should return false', (t) => {
    const req = {
      clean: {}
    };

    t.notOk(isCoarseReverse(req));
    t.end();

  });

  test('request with empty layers should return false', (t) => {
    const req = {
      clean: {
        layers: []
      }
    };

    t.notOk(isCoarseReverse(req));
    t.end();

  });

  test('request with layers just "address" or "venue" return false', (t) => {
    ['address', 'street', 'venue'].forEach((non_coarse_layer) => {
      const req = {
        clean: {
          layers: [non_coarse_layer]
        }
      };

      t.notOk(isCoarseReverse(req));

    });

    t.end();

  });

  test('request with layers containing "address" or "venue" and a coarse layer should return false', (t) => {
    ['address', 'street', 'venue'].forEach((non_coarse_layer) => {
      const req = {
        clean: {
          layers: [_.sample(coarse_layers), non_coarse_layer]
        }
      };

      t.notOk(isCoarseReverse(req));

    });

    t.end();

  });

  test('request with layers containing "address" and "venue" should return false', (t) => {
    const req = {
      clean: {
        layers: ['address', 'venue']
      }
    };

    t.notOk(isCoarseReverse(req));
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

      t.ok(isCoarseReverse(req));

    });

    t.end();

  });

};

module.exports.all = (tape, common) => {
  function test(name, testFunction) {
    return tape(`isCoarseReverse ${name}`, testFunction);
  }

  for( const testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
