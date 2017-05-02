module.exports.tests = {};

const PointInPolygon = require('../../../../service/configurations/PointInPolygon');

module.exports.tests.all = (test, common) => {
  test('getName should return \'pip\'', (t) => {
    const configBlob = {
      url: 'base url',
      timeout: 17,
      retries: 19
    };

    const pointInPolygon = new PointInPolygon(configBlob);

    t.equals(pointInPolygon.getName(), 'pip');
    t.equals(pointInPolygon.getBaseUrl(), 'base url');
    t.equals(pointInPolygon.getTimeout(), 17);
    t.equals(pointInPolygon.getRetries(), 19);
    t.end();

  });

  test('getUrl should return value formatted with point.lon/lat passed to constructor', (t) => {
    const configBlob = {
      url: 'base url'
    };

    const pointInPolygon = new PointInPolygon(configBlob);

    const req = {
      clean: {
        point: {
          lat: 12.121212,
          lon: 21.212121
        }
      }
    };

    t.equals(pointInPolygon.getUrl(req), 'base url/21.212121/12.121212');
    t.end();

  });

  test('getHeaders should return an empty object', (t) => {
    const configBlob = {
      url: 'base url',
      timeout: 17,
      retries: 19
    };

    const pointInPolygon = new PointInPolygon(configBlob);

    t.deepEquals(pointInPolygon.getHeaders(), {});
    t.end();

  });

  test('getParameters should return an empty object', (t) => {
    const configBlob = {
      url: 'base url',
      timeout: 17,
      retries: 19
    };

    const pointInPolygon = new PointInPolygon(configBlob);

    t.deepEquals(pointInPolygon.getParameters(), {});
    t.end();

  });

};

module.exports.all = (tape, common) => {
  function test(name, testFunction) {
    return tape(`SERVICE CONFIGURATION /PointInPolygon ${name}`, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
