module.exports.tests = {};

const PlaceHolder = require('../../../../service/configurations/placeholder');

module.exports.tests.all = (test, common) => {
  test('getName should return \'placeholder\'', (t) => {
    const placeholder = new PlaceHolder('base url');

    t.equals(placeholder.getName(), 'placeholder');
    t.end();

  });

  test('getBaseUrl should return value passed to constructor', (t) => {
    const placeholder = new PlaceHolder('base url');

    t.equals(placeholder.getBaseUrl(), 'base url');
    t.end();

  });

  test('getUrl should return value passed to constructor', (t) => {
    const placeholder = new PlaceHolder('base url');

    t.equals(placeholder.getUrl('this is not an object'), 'base url/search');
    t.end();

  });

  test('getParameters should return object with text and lang from req', (t) => {
    const placeholder = new PlaceHolder('base url');

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
    const placeholder = new PlaceHolder('base url');

    t.deepEquals(placeholder.getHeaders('this is not an object'), {});
    t.end();

  });

  test('getParameters should not include lang if req.clean.lang is unavailable', (t) => {
    const placeholder = new PlaceHolder('base url');

    const req = {
      clean: {
        text: 'text value'
      }
    };

    t.deepEquals(placeholder.getParameters(req), { text: 'text value' });
    t.end();

  });

  test('getParameters should not include lang if req.clean.lang.iso6393 is unavailable', (t) => {
    const placeholder = new PlaceHolder('base url');

    const req = {
      clean: {
        text: 'text value',
        lang: {}
      }
    };

    t.deepEquals(placeholder.getParameters(req), { text: 'text value' });
    t.end();

  });

};

module.exports.all = (tape, common) => {
  function test(name, testFunction) {
    return tape(`SERVICE CONFIGURATION /placeholder ${name}`, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
