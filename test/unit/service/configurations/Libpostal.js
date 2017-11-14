const Libpostal = require('../../../../service/configurations/Libpostal');

module.exports.tests = {};

module.exports.tests.all = (test, common) => {
  test('getName should return \'libpostal\'', (t) => {
    const configBlob = {
      url: 'http://localhost:1234',
      timeout: 17,
      retries: 19
    };

    const libpostal = new Libpostal(configBlob);

    t.equals(libpostal.getName(), 'libpostal');
    t.equals(libpostal.getBaseUrl(), 'http://localhost:1234/');
    t.equals(libpostal.getTimeout(), 17);
    t.equals(libpostal.getRetries(), 19);
    t.end();

  });

  test('getUrl should return value passed to constructor', (t) => {
    const configBlob = {
      url: 'http://localhost:1234',
      timeout: 17,
      retries: 19
    };

    const libpostal = new Libpostal(configBlob);

    t.equals(libpostal.getUrl(), 'http://localhost:1234/parse');
    t.end();

  });

  test('getParameters should return object with text and lang from req', (t) => {
    const configBlob = {
      url: 'http://localhost:1234',
      timeout: 17,
      retries: 19
    };

    const propertyExtractor = (req) => {
      t.deepEquals(req, { a: 1, b: 2});
      return 'property value';
    };

    const libpostal = new Libpostal(configBlob, propertyExtractor);

    const req = {
      a: 1,
      b: 2
    };

    t.deepEquals(libpostal.getParameters(req), { address: 'property value' });
    t.end();

  });

  test('getHeaders should return empty object', (t) => {
    const configBlob = {
      url: 'base url',
      timeout: 17,
      retries: 19
    };

    const libpostal = new Libpostal(configBlob);

    t.deepEquals(libpostal.getHeaders(), {});
    t.end();

  });

  test('baseUrl ending in / should not have double /\'s return by getUrl', (t) => {
    const configBlob = {
      url: 'http://localhost:1234/',
      timeout: 17,
      retries: 19
    };

    const libpostal = new Libpostal(configBlob);

    t.deepEquals(libpostal.getUrl(), 'http://localhost:1234/parse');
    t.end();

  });

};

module.exports.all = (tape, common) => {
  function test(name, testFunction) {
    return tape(`SERVICE CONFIGURATION /Libpostal ${name}`, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
