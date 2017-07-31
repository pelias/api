module.exports.tests = {};

const PlaceHolder = require('../../../../service/configurations/PlaceHolder');

module.exports.tests.all = (test, common) => {
  test('getName should return \'placeholder\'', (t) => {
    const configBlob = {
      url: 'http://localhost:1234',
      timeout: 17,
      retries: 19
    };

    const placeholder = new PlaceHolder(configBlob);

    t.equals(placeholder.getName(), 'placeholder');
    t.equals(placeholder.getBaseUrl(), 'http://localhost:1234/');
    t.equals(placeholder.getTimeout(), 17);
    t.equals(placeholder.getRetries(), 19);
    t.end();

  });

  test('getUrl should return value passed to constructor', (t) => {
    const configBlob = {
      url: 'http://localhost:1234',
      timeout: 17,
      retries: 19
    };

    const placeholder = new PlaceHolder(configBlob);

    t.equals(placeholder.getUrl(), 'http://localhost:1234/parser/search');
    t.end();

  });

  test('getParameters should return object with text and lang from req', (t) => {
    const configBlob = {
      url: 'http://localhost:1234',
      timeout: 17,
      retries: 19
    };

    const placeholder = new PlaceHolder(configBlob);

    const req = {
      clean: {
        text: 'text value',
        lang: {
          iso6393: 'lang value'
        }
      }
    };

    t.deepEquals(placeholder.getParameters(req), { text: 'text value', lang: 'lang value' });
    t.end();

  });

  test('getHeaders should return empty object', (t) => {
    const configBlob = {
      url: 'base url',
      timeout: 17,
      retries: 19
    };

    const placeholder = new PlaceHolder(configBlob);

    t.deepEquals(placeholder.getHeaders(), {});
    t.end();

  });

  test('getParameters should not include lang if req.clean.lang is unavailable', (t) => {
    const configBlob = {
      url: 'base url',
      timeout: 17,
      retries: 19
    };

    const placeholder = new PlaceHolder(configBlob);

    const req = {
      clean: {
        text: 'text value'
      }
    };

    t.deepEquals(placeholder.getParameters(req), { text: 'text value' });
    t.end();

  });

  test('getParameters should not include lang if req.clean.lang.iso6393 is unavailable', (t) => {
    const configBlob = {
      url: 'base url',
      timeout: 17,
      retries: 19
    };

    const placeholder = new PlaceHolder(configBlob);

    const req = {
      clean: {
        text: 'text value',
        lang: {}
      }
    };

    t.deepEquals(placeholder.getParameters(req), { text: 'text value' });
    t.end();

  });

  test('baseUrl ending in / should not have double /\'s return by getUrl', (t) => {
    const configBlob = {
      url: 'http://localhost:1234/',
      timeout: 17,
      retries: 19
    };

    const placeholder = new PlaceHolder(configBlob);

    t.deepEquals(placeholder.getUrl(), 'http://localhost:1234/parser/search');
    t.end();

  });

  test('existence of street in req.clean.parsed_text should assemble text parameter from admin fields', (t) => {
    const configBlob = {
      url: 'http://localhost:1234',
    };

    const placeholder = new PlaceHolder(configBlob);

    const req = {
      clean: {
        text: 'text value',
        parsed_text: {
          street: 'street value',
          neighbourhood: 'neighbourhood value',
          borough: 'borough value',
          city: 'city value',
          county: 'county value',
          state: 'state value',
          country: 'country value'
        }
      }
    };

    t.deepEquals(placeholder.getParameters(req), {
      text: 'neighbourhood value borough value city value county value state value country value'
    });
    t.end();

  });

  test('existence of street in req.clean.parsed_text should assemble text parameter from defined admin fields', (t) => {
    const configBlob = {
      url: 'http://localhost:1234',
    };

    const placeholder = new PlaceHolder(configBlob);

    const req = {
      clean: {
        text: 'text value',
        parsed_text: {
          street: 'street value',
          country: 'country value'
        }
      }
    };

    t.deepEquals(placeholder.getParameters(req), {
      text: 'country value'
    });
    t.end();

  });

};

module.exports.all = (tape, common) => {
  function test(name, testFunction) {
    return tape(`SERVICE CONFIGURATION /PlaceHolder ${name}`, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
