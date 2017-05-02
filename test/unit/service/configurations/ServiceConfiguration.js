module.exports.tests = {};

const ServiceConfiguration = require('../../../../service/configurations/ServiceConfiguration');

module.exports.tests.all = (test, common) => {
  test('timeout and retries overrides should be returned by getters', (t) => {
    const configBlob = {
      url: 'base url',
      timeout: 17,
      retries: 19
    };

    const serviceConfiguration = new ServiceConfiguration('service name', configBlob);

    t.equals(serviceConfiguration.getName(), 'service name');
    t.equals(serviceConfiguration.getBaseUrl(), 'base url');
    t.deepEquals(serviceConfiguration.getParameters(), {});
    t.deepEquals(serviceConfiguration.getHeaders(), {});
    t.equals(serviceConfiguration.getUrl(), 'base url');
    t.equals(serviceConfiguration.getRetries(), 19);
    t.equals(serviceConfiguration.getTimeout(), 17);
    t.end();

  });

  test('configBlob w/o timeout or retries should default to 250 and 3, respectively', (t) => {
    const configBlob = {
      url: 'base url'
    };

    const serviceConfiguration = new ServiceConfiguration('service name', configBlob);

    t.equals(serviceConfiguration.getTimeout(), 250, 'should be a default of 250');
    t.equals(serviceConfiguration.getRetries(), 3, 'should be a default of 3');
    t.end();

  });

  test('missing name should throw error', (t) => {
    t.throws(() => {
      // lint complains if using `new` and not assigning to something
      const config = new ServiceConfiguration(undefined, { url: 'base url' });
    }, /^name is required$/);
    t.end();

  });

};

module.exports.all = (tape, common) => {
  function test(name, testFunction) {
    return tape(`SERVICE CONFIGURATION /ServiceConfiguration ${name}`, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
