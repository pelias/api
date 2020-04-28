const _ = require('lodash');
const isOnlyNonAdminLayers = require('../../../../controller/predicates/isOnlyNonAdminLayers');

module.exports.tests = {};

module.exports.tests.interface = (test, common) => {
  test('valid interface', t => {
    t.equal(typeof isOnlyNonAdminLayers, 'function', 'isOnlyNonAdminLayers is a function');
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

      t.ok(isOnlyNonAdminLayers(req));

    });

    t.end();

  });

};

module.exports.tests.false_conditions = (test, common) => {
  test('request with undefined clean should return false', t => {
    const req = {};

    t.notOk(isOnlyNonAdminLayers(req));
    t.end();

  });

  test('request.clean without layers parameter should return false', t => {
    const req = {
      clean: {}
    };

    t.notOk(isOnlyNonAdminLayers(req));
    t.end();

  });

  test('request with empty layers should return false', t => {
    const req = {
      clean: {
        layers: []
      }
    };

    t.notOk(isOnlyNonAdminLayers(req));
    t.end();

  });

  test('request.clean.layers without venue, address, or street should return false', t => {
    const req = {
      clean: {
        layers: ['locality']
      }
    };

    t.notOk(isOnlyNonAdminLayers(req));
    t.end();

  });

  test('request.clean.layers with other layers besides venue, address, or street should return false', t => {
    ['venue', 'address', 'street'].forEach(non_admin_layer => {
      const req = {
        clean: {
          layers: ['locality', non_admin_layer]
        }
      };

      t.notOk(isOnlyNonAdminLayers(req));

    });

    t.end();

  });

};

module.exports.all = (tape, common) => {
  function test(name, testFunction) {
    return tape(`IsOnlyNonAdminLayers ${name}`, testFunction);
  }

  for( const testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
