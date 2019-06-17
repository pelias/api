const _ = require('lodash');
const is_request_layers_any_address_related = require('../../../../controller/predicates/is_request_layers_any_address_related');

module.exports.tests = {};

module.exports.tests.true_conditions = (test, common) => {
  test('empty layers (none specified) should return true', t => {
    const req = {};

    t.ok(is_request_layers_any_address_related(req));
    t.end();
  });

  test('street layer only should return true', t => {
    const req = { clean: { layers: ['street'] } };

    t.ok(is_request_layers_any_address_related(req));
    t.end();
  });

  test('address and postalcode layers should return true', t => {
    const req = { clean: { layers: ['address', 'postalcode'] } };

    t.ok(is_request_layers_any_address_related(req));
    t.end();
  });

  test('street and admin layers should return true', t => {
    const req = { clean: { layers: ['street', 'macrocounty'] } };

    t.ok(is_request_layers_any_address_related(req));
    t.end();
  });
};

module.exports.tests.false_conditions = (test, common) => {
  test('venue layers only should return false', t => {
    const req = { clean: { layers: ['venue'] } };

    t.notOk(is_request_layers_any_address_related(req));
    t.end();
  });

  test('custom layer only should return false', t => {
    const req = { clean: { layers: ['custom'] } };

    t.notOk(is_request_layers_any_address_related(req));
    t.end();
  });

  test('admin layers only should return false', t => {
    const req = { clean: { layers: ['locality', 'county', 'country'] } };

    t.notOk(is_request_layers_any_address_related(req));
    t.end();
  });

};

module.exports.all = (tape, common) => {
  function test(name, testFunction) {
    return tape(`is_request_layers_any_address_related ${name}`, testFunction);
  }

  for( const testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
