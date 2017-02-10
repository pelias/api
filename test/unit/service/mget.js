const proxyquire = require('proxyquire').noCallThru();

module.exports.tests = {};

module.exports.tests.interface = (test, common) => {
  test('valid interface', (t) => {
    var service = proxyquire('../../../service/mget', {
      'pelias-logger': {
        get: (section) => {
          t.equal(section, 'api');
        }
      }

    });

    t.equal(typeof service, 'function', 'service is a function');
    t.end();
  });
};

module.exports.tests.error_conditions = (test, common) => {
  test('esclient.mget returning error should log and pass it on', (t) => {
    const errorMessages = [];

    const service = proxyquire('../../../service/mget', {
      'pelias-logger': {
        get: () => {
          return {
            error: (msg) => {
              errorMessages.push(msg);
            }
          };
        }
      }
    });

    const expectedCmd = {
      body: {
        docs: 'this is the query'
      }
    };

    const esclient = {
      mget: (cmd, callback) => {
        t.deepEquals(cmd, expectedCmd);

        const err = 'this is an error';
        const data = {
          docs: [
            {
              found: true,
              _id: 'doc id',
              _type: 'doc type',
              _source: {}
            }
          ]
        };

        callback('this is an error', data);

      }
    };

    const next = (err, docs) => {
      t.equals(err, 'this is an error', 'err should have been passed on');
      t.equals(docs, undefined);

      t.ok(errorMessages.find((msg) => {
        return msg === `elasticsearch error ${err}`;
      }));
      t.end();
    };

    service(esclient, 'this is the query', next);

  });
};

module.exports.tests.success_conditions = (test, common) => {
  test('esclient.mget returning data.docs should filter and map', (t) => {
    const errorMessages = [];

    const service = proxyquire('../../../service/mget', {
      'pelias-logger': {
        get: () => {
          return {
            error: (msg) => {
              errorMessages.push(msg);
            }
          };
        }
      }
    });

    const expectedCmd = {
      body: {
        docs: 'this is the query'
      }
    };

    const esclient = {
      mget: (cmd, callback) => {
        t.deepEquals(cmd, expectedCmd);

        const data = {
          docs: [
            {
              found: true,
              _id: 'doc id 1',
              _type: 'doc type 1',
              _source: {
                random_key: 'value 1'
              }
            },
            {
              found: false,
              _id: 'doc id 2',
              _type: 'doc type 2',
              _source: {}
            },
            {
              found: true,
              _id: 'doc id 3',
              _type: 'doc type 3',
              _source: {
                random_key: 'value 3'
              }
            }
          ]
        };

        callback(undefined, data);

      }
    };

    const expectedDocs = [
      {
        _id: 'doc id 1',
        _type: 'doc type 1',
        random_key: 'value 1'
      },
      {
        _id: 'doc id 3',
        _type: 'doc type 3',
        random_key: 'value 3'
      }

    ];

    const next = (err, docs) => {
      t.equals(err, null);
      t.deepEquals(docs, expectedDocs);

      t.equals(errorMessages.length, 0, 'no errors should have been logged');
      t.end();
    };

    service(esclient, 'this is the query', next);

  });

  test('esclient.mget callback with falsy data should return empty array', (t) => {
    const errorMessages = [];

    const service = proxyquire('../../../service/mget', {
      'pelias-logger': {
        get: () => {
          return {
            error: (msg) => {
              errorMessages.push(msg);
            }
          };
        }
      }
    });

    const expectedCmd = {
      body: {
        docs: 'this is the query'
      }
    };

    const esclient = {
      mget: (cmd, callback) => {
        t.deepEquals(cmd, expectedCmd);

        callback(undefined, undefined);

      }
    };

    const expectedDocs = [];

    const next = (err, docs) => {
      t.equals(err, null);
      t.deepEquals(docs, expectedDocs);

      t.equals(errorMessages.length, 0, 'no errors should have been logged');
      t.end();
    };

    service(esclient, 'this is the query', next);

  });

  test('esclient.mget callback with non-array data.docs should return empty array', (t) => {
    const errorMessages = [];

    const service = proxyquire('../../../service/mget', {
      'pelias-logger': {
        get: () => {
          return {
            error: (msg) => {
              errorMessages.push(msg);
            }
          };
        }
      }
    });

    const expectedCmd = {
      body: {
        docs: 'this is the query'
      }
    };

    const esclient = {
      mget: (cmd, callback) => {
        t.deepEquals(cmd, expectedCmd);

        const data = {
          docs: 'this isn\'t an array'
        };

        callback(undefined, data);

      }
    };

    const expectedDocs = [];

    const next = (err, docs) => {
      t.equals(err, null);
      t.deepEquals(docs, expectedDocs);

      t.equals(errorMessages.length, 0, 'no errors should have been logged');
      t.end();
    };

    service(esclient, 'this is the query', next);

  });

};

module.exports.all = (tape, common) => {

  function test(name, testFunction) {
    return tape('SERVICE /mget ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
