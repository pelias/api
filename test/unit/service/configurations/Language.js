module.exports.tests = {};

const Language = require('../../../../service/configurations/Language');

module.exports.tests.all = (test, common) => {
  test('getName should return \'language\'', (t) => {
    const configBlob = {
      url: 'http://localhost:1234',
      timeout: 17,
      retries: 19
    };

    const language = new Language(configBlob);

    t.equals(language.getName(), 'language');
    t.equals(language.getBaseUrl(), 'http://localhost:1234/');
    t.equals(language.getTimeout(), 17);
    t.equals(language.getRetries(), 19);
    t.end();

  });

  test('getUrl should return value passed to constructor', (t) => {
    const configBlob = {
      url: 'http://localhost:1234',
      timeout: 17,
      retries: 19
    };

    const language = new Language(configBlob);

    t.equals(language.getUrl(), 'http://localhost:1234/parser/findbyid');
    t.end();

  });

  test('getParameters should return object with all deduped ids extracted from res', (t) => {
    const configBlob = {
      url: 'http://localhost:1234',
      timeout: 17,
      retries: 19
    };

    const language = new Language(configBlob);

    const res = {
      data: [
        {
          parent: {
            layer1_name: 'layer1 name',
            layer1_id: [1],
            layer2_name: 'layer2 name',
            layer2_id: [2]
          }
        },
        {
          // empty parent
          parent: {}
        },
        {
          // no parent
        },
        {
          parent: {
            layer3_name: 'layer3 name',
            layer3_id: [3],
            layer4_name: 'layer4 name',
            // doesn't end with '_id', will be ignored
            layer4id: [4]
          }
        },
        {
          parent: {
            // this is a duplicate id
            layer1_name: 'layer1 name',
            layer1_id: [1],
            // two ids, both should be added
            layer5_name: 'layer5 name',
            layer5_id: [5, 6]
          }
        }
      ]
    };

    t.deepEquals(language.getParameters(undefined, res), { ids: '1,2,3,5,6' });
    t.end();

  });

  test('getParameters should return empty ids array when res is undefined', (t) => {
    const configBlob = {
      url: 'http://localhost:1234',
      timeout: 17,
      retries: 19
    };

    const language = new Language(configBlob);

    t.deepEquals(language.getParameters(undefined, undefined), { ids: '' });
    t.end();

  });

  test('getParameters should return empty ids array when res.data is undefined', (t) => {
    const configBlob = {
      url: 'http://localhost:1234',
      timeout: 17,
      retries: 19
    };

    const res = { };

    const language = new Language(configBlob);

    t.deepEquals(language.getParameters(undefined, res), { ids: '' });
    t.end();

  });

  test('getHeaders should return empty object', (t) => {
    const configBlob = {
      url: 'base url',
      timeout: 17,
      retries: 19
    };

    const language = new Language(configBlob);

    t.deepEquals(language.getHeaders(), {});
    t.end();

  });

  test('baseUrl ending in / should not have double /\'s return by getUrl', (t) => {
    const configBlob = {
      url: 'http://localhost:1234/',
      timeout: 17,
      retries: 19
    };

    const language = new Language(configBlob);

    t.deepEquals(language.getUrl(), 'http://localhost:1234/parser/findbyid');
    t.end();

  });

};

module.exports.all = (tape, common) => {
  function test(name, testFunction) {
    return tape(`SERVICE CONFIGURATION /Language ${name}`, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
