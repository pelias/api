const _ = require('lodash');
const isRequestLayersAnyAddressRelated = require('../../../../controller/predicates/isRequestLayersAnyAddressRelated');

module.exports.tests = {};

module.exports.tests.true_conditions = (test, common) => {
  test('empty layers (none specified) should return true', t => {
    const req = {};

    t.ok(isRequestLayersAnyAddressRelated(req));
    t.end();
  });

  test('street layer only should return true', t => {
    const req = { clean: { layers: ['street'] } };

    t.ok(isRequestLayersAnyAddressRelated(req));
    t.end();
  });

  test('address and postalcode layers should return true', t => {
    const req = { clean: { layers: ['address', 'postalcode'] } };

    t.ok(isRequestLayersAnyAddressRelated(req));
    t.end();
  });

  test('street and admin layers should return true', t => {
    const req = { clean: { layers: ['street', 'macrocounty'] } };

    t.ok(isRequestLayersAnyAddressRelated(req));
    t.end();
  });
};

module.exports.tests.false_conditions = (test, common) => {
  test('venue layers only should return false', t => {
    const req = { clean: { layers: ['venue'] } };

    t.notOk(isRequestLayersAnyAddressRelated(req));
    t.end();
  });

  test('custom layer only should return false', t => {
    const req = { clean: { layers: ['custom'] } };

    t.notOk(isRequestLayersAnyAddressRelated(req));
    t.end();
  });

  test('admin layers only should return false', t => {
    const req = { clean: { layers: ['locality', 'county', 'country'] } };

    t.notOk(isRequestLayersAnyAddressRelated(req));
    t.end();
  });

};

module.exports.all = (tape, common) => {
  function test(name, testFunction) {
    return tape(`isRequestLayersAnyAddressRelated ${name}`, testFunction);
  }

  for( const testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
