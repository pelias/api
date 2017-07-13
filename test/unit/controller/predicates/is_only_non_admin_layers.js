'use strict';

const _ = require('lodash');
const is_only_non_admin_layers = require('../../../../controller/predicates/is_only_non_admin_layers');

module.exports.tests = {};

module.exports.tests.interface = (test, common) => {
  test('valid interface', t => {
    t.equal(typeof is_only_non_admin_layers, 'function', 'is_only_non_admin_layers is a function');
    t.end();
  });
};

module.exports.tests.true_conditions = (test, common) => {
  test('request with specified parameter should return true', t => {
    [
      ['venue', 'address', 'street'],
      ['venue', 'address'],
      ['venue', 'street'],
      ['address', 'street'],
      ['venue'],
      ['address'],
      ['street']
    ].forEach(layers => {
      const req = {
        clean: {
          layers: layers
        }
      };

      t.ok(is_only_non_admin_layers(req));

    });

    t.end();

  });

};

module.exports.tests.false_conditions = (test, common) => {
  test('request with undefined clean should return false', t => {
    const req = {};

    t.notOk(is_only_non_admin_layers(req));
    t.end();

  });

  test('request.clean without layers parameter should return false', t => {
    const req = {
      clean: {}
    };

    t.notOk(is_only_non_admin_layers(req));
    t.end();

  });

  test('request with empty layers should return false', t => {
    const req = {
      clean: {
        layers: []
      }
    };

    t.notOk(is_only_non_admin_layers(req));
    t.end();

  });

  test('request.clean.layers without venue, address, or street should return false', t => {
    const req = {
      clean: {
        layers: ['locality']
      }
    };

    t.notOk(is_only_non_admin_layers(req));
    t.end();

  });

  test('request.clean.layers with other layers besides venue, address, or street should return false', t => {
    ['venue', 'address', 'street'].forEach(non_admin_layer => {
      const req = {
        clean: {
          layers: ['locality', non_admin_layer]
        }
      };

      t.notOk(is_only_non_admin_layers(req));

    });

    t.end();

  });

};

module.exports.all = (tape, common) => {
  function test(name, testFunction) {
    return tape(`GET /is_only_non_admin_layers ${name}`, testFunction);
  }

  for( const testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
