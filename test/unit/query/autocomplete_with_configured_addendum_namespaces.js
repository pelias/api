const proxyquire = require('proxyquire').noCallThru();
const realPeliasConfig = require('pelias-config');
const peliasConfig = {
  generate: function() {
    const config =  realPeliasConfig.generateDefaults();
    config.addendum_namespaces = {
      tariff_zone_ids: {
        type: 'array'
      }
    };
    return config;
  }
};

const generate = proxyquire('../../../query/autocomplete', {
  'pelias-config': peliasConfig
});

module.exports.tests = {};

module.exports.tests.interface = function(test, common) {
  test('valid interface', function(t) {
    t.equal(typeof generate, 'function', 'valid function');
    t.end();
  });
};

module.exports.tests.query = function(test, common) {
  test('single configured addendum namespace', function(t) {
    const query = generate({
      text: 'something',
      tokens: ['something'],
      tokens_complete: [],
      tokens_incomplete: ['something'],
      tariff_zone_ids: ['TAR-123', 'TAR-345']
    });

    const compiled = JSON.parse( JSON.stringify( query ) );

    const expected = require('../fixture/autocomplete_configured_addendum_namespace.js');
    common.diff(compiled.body, expected);

    t.deepEqual(compiled.type, 'autocomplete', 'query type set');
    t.deepEqual(compiled.body, expected, 'autocomplete_configured_addendum_namespace');
    t.end();
  });

  test('Multiple configured addendum namespace', function(t) {
    const query = generate({
      text: 'something',
      tokens: ['something'],
      tokens_complete: [],
      tokens_incomplete: ['something'],
      tariff_zone_ids: ['TAR-123', 'TAR-345'],
      tariff_zone_authorities: ['TAR']
    });

    const compiled = JSON.parse( JSON.stringify( query ) );

    const expected = require('../fixture/autocomplete_configured_addendum_namespace.js');
    common.diff(compiled.body, expected);

    t.deepEqual(compiled.type, 'autocomplete', 'query type set');
    t.deepEqual(compiled.body, expected, 'autocomplete_configured_addendum_namespace');
    t.end();
  });

};

module.exports.all = function (tape, common) {

  function test(name, testFunction) {
    return tape('autocomplete query ' + name, testFunction);
  }

  for( const testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
