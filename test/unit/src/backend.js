var proxyquire = require('proxyquire');

var stubConfig = {
  generate: function generate() {
    return {
      esclient: {
        hosts: [
          'http://notLocalhost:9200',
          'http://anotherHost:9200'
        ]
      }
    };
  }
};


module.exports.tests = {};

module.exports.tests.config_properly_passed = function(test, common) {
  test('Elasticsearch config is properly passed to elasticsearch module', function(t) {
    var stubElasticsearchClient = {
      Client: function(config) {
        t.deepEquals(config.hosts, [ 'http://notLocalhost:9200', 'http://anotherHost:9200' ], 'hosts set correctly' );
        t.end();
      }
    };

    proxyquire('../../../src/backend', { 'pelias-config': stubConfig, 'elasticsearch': stubElasticsearchClient } );
  });
};

module.exports.all = function (tape, common) {
  function test(name, testFunction) {
    return tape('SANTIZE src/backend ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
