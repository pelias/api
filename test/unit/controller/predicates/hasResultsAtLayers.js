const _ = require('lodash');
const hasResultsAtLayers = require('../../../../controller/predicates/hasResultsAtLayers');

module.exports.tests = {};

module.exports.tests.interface = (test, common) => {
  test('valid interface', (t) => {
    t.equal(typeof hasResultsAtLayers, 'function', 'hasResultsAtLayers is a function');
    t.equal(hasResultsAtLayers.length, 1);
    t.end();
  });
};

module.exports.tests.true_conditions = (test, common) => {
  test('should return true when any result.layer matches any layer in array', (t) => {
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

    t.ok(hasResultsAtLayers(['layer 2', 'layer 4'])(req, res));
    t.end();

  });

  test('should return true when any result.layer matches layer string', (t) => {
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

    t.ok(hasResultsAtLayers('layer 2')(req, res));
    t.end();

  });

};

module.exports.tests.false_conditions = (test, common) => {
  test('should return false when response has undefined data', (t) => {
    const req = {};
    const res = {};

    t.notOk(hasResultsAtLayers('layer')(req, res));
    t.end();

  });

  test('should return false when response has empty data array', (t) => {
    const req = {};
    const res = {
      data: []
    };

    t.notOk(hasResultsAtLayers('layer')(req, res));
    t.end();

  });

  test('should return false when layer is a substring of non-array string layers parameter', (t) => {
    const req = {};
    const res = {
      data: [
        {
          layer: 'aye'
        }
      ]
    };

    t.notOk(hasResultsAtLayers('layer')(req, res));
    t.end();

  });

  test('should return false when no results have layer in supplied layers', (t) => {
    const req = {};
    const res = {
      data: [
        {
          layer: 'layer 1'
        }
      ]
    };

    t.notOk(hasResultsAtLayers(['layer 2', 'layer 3'])(req, res));
    t.end();

  });

};

module.exports.all = (tape, common) => {
  function test(name, testFunction) {
    return tape(`hasResultsAtLayers ${name}`, testFunction);
  }

  for( const testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
