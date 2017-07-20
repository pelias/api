module.exports.tests = {};

const Interpolation = require('../../../../service/configurations/Interpolation');

module.exports.tests.all = (test, common) => {
  test('getName should return \'interpolation\'', t => {
    const configBlob = {
      url: 'http://localhost:1234',
      timeout: 17,
      retries: 19
    };

    const interpolation = new Interpolation(configBlob);

    t.equals(interpolation.getName(), 'interpolation');
    t.equals(interpolation.getBaseUrl(), 'http://localhost:1234/');
    t.equals(interpolation.getTimeout(), 17);
    t.equals(interpolation.getRetries(), 19);
    t.end();

  });

  test('getUrl should return value passed to constructor', t => {
    const configBlob = {
      url: 'http://localhost:1234'
    };

    const interpolation = new Interpolation(configBlob);

    t.equals(interpolation.getUrl(), 'http://localhost:1234/search/geojson');
    t.end();

  });

  test('getHeaders should return empty object', t => {
    const configBlob = {
      url: 'base url'
    };

    const interpolation = new Interpolation(configBlob);

    t.deepEquals(interpolation.getHeaders(), {});
    t.end();

  });

  test('getParameters should return hit.address_parts.street over req.clean.parsed_text.street', t => {
    const configBlob = {
      url: 'base url'
    };

    const interpolation = new Interpolation(configBlob);

    const req = {
      clean: {
        parsed_text: {
          number: 'parsed number value',
          street: 'parsed street value'
        }
      }
    };

    const hit = {
      address_parts: {
        street: 'hit street value'
      },
      center_point: {
        lat: 12.121212,
        lon: 21.212121
      }
    };

    t.deepEquals(interpolation.getParameters(req, hit), {
      number: 'parsed number value',
      street: 'hit street value',
      lat: 12.121212,
      lon: 21.212121
    });
    t.end();

  });

  test('getParameters should return req.clean.parsed_text.street when hit.address_parts.street unavailable', t => {
    const configBlob = {
      url: 'base url'
    };

    const interpolation = new Interpolation(configBlob);

    const req = {
      clean: {
        parsed_text: {
          number: 'parsed number value',
          street: 'parsed street value'
        }
      }
    };

    const hit = {
      address_parts: {
      },
      center_point: {
        lat: 12.121212,
        lon: 21.212121
      }
    };

    t.deepEquals(interpolation.getParameters(req, hit), {
      number: 'parsed number value',
      street: 'parsed street value',
      lat: 12.121212,
      lon: 21.212121
    });
    t.end();

  });

  test('baseUrl ending in / should not have double /\'s return by getUrl', t => {
    const configBlob = {
      url: 'http://localhost:1234/'
    };

    const interpolation = new Interpolation(configBlob);

    t.deepEquals(interpolation.getUrl(), 'http://localhost:1234/search/geojson');
    t.end();

  });

};

module.exports.all = (tape, common) => {
  function test(name, testFunction) {
    return tape(`SERVICE CONFIGURATION /Interpolation ${name}`, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
