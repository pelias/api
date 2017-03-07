const proxyquire = require('proxyquire').noCallThru();

module.exports.tests = {};

module.exports.tests.interface = (test, common) => {
  test('valid interface', (t) => {
    var service = proxyquire('../../../service/search', {
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
  test('esclient.search returning error should log and pass it on', (t) => {
    const errorMessages = [];

    const service = proxyquire('../../../service/search', {
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

    const esclient = {
      search: (cmd, callback) => {
        t.deepEquals(cmd, 'this is the query');

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
  test('esclient.search returning data.docs should filter and map', (t) => {
    const errorMessages = [];

    const service = proxyquire('../../../service/search', {
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

    const esclient = {
      search: (cmd, callback) => {
        t.deepEquals(cmd, 'this is the query');

        const data = {
          hits: {
            total: 17,
            hits: [
              {
                _score: 'score 1',
                _id: 'doc id 1',
                _type: 'doc type 1',
                matched_queries: 'matched_queries 1',
                _source: {
                  random_key: 'value 1'
                }
              },
              {
                _score: 'score 2',
                _id: 'doc id 2',
                _type: 'doc type 2',
                matched_queries: 'matched_queries 2',
                _source: {
                  random_key: 'value 2'
                }
              }
            ]
          }
        };

        callback(undefined, data);

      }
    };

    const expectedDocs = [
      {
        _score: 'score 1',
        _id: 'doc id 1',
        _type: 'doc type 1',
        random_key: 'value 1',
        _matched_queries: 'matched_queries 1'
      },
      {
        _score: 'score 2',
        _id: 'doc id 2',
        _type: 'doc type 2',
        random_key: 'value 2',
        _matched_queries: 'matched_queries 2'
      }
    ];

    const expectedMeta = {
      scores: ['score 1', 'score 2']
    };

    const next = (err, docs, meta) => {
      t.equals(err, null);
      t.deepEquals(docs, expectedDocs);
      t.deepEquals(meta, expectedMeta);

      t.equals(errorMessages.length, 0, 'no errors should have been logged');
      t.end();
    };

    service(esclient, 'this is the query', next);

  });

  test('esclient.search returning falsy data should return empty docs and meta', (t) => {
    const errorMessages = [];

    const service = proxyquire('../../../service/search', {
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

    const esclient = {
      search: (cmd, callback) => {
        t.deepEquals(cmd, 'this is the query');

        callback(undefined, undefined);

      }
    };

    const expectedDocs = [];
    const expectedMeta = { scores: [] };

    const next = (err, docs, meta) => {
      t.equals(err, null);
      t.deepEquals(docs, expectedDocs);
      t.deepEquals(meta, expectedMeta);

      t.equals(errorMessages.length, 0, 'no errors should have been logged');
      t.end();
    };

    service(esclient, 'this is the query', next);

  });

  test('esclient.search returning falsy data.hits should return empty docs and meta', (t) => {
    const errorMessages = [];

    const service = proxyquire('../../../service/search', {
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

    const esclient = {
      search: (cmd, callback) => {
        t.deepEquals(cmd, 'this is the query');

        const data = {
          hits: {
            total: 17
          }
        };

        callback(undefined, data);

      }
    };

    const expectedDocs = [];
    const expectedMeta = { scores: [] };

    const next = (err, docs, meta) => {
      t.equals(err, null);
      t.deepEquals(docs, expectedDocs);
      t.deepEquals(meta, expectedMeta);

      t.equals(errorMessages.length, 0, 'no errors should have been logged');
      t.end();
    };

    service(esclient, 'this is the query', next);

  });

  test('esclient.search returning falsy data.hits.total should return empty docs and meta', (t) => {
    const errorMessages = [];

    const service = proxyquire('../../../service/search', {
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

    const esclient = {
      search: (cmd, callback) => {
        t.deepEquals(cmd, 'this is the query');

        const data = {
          hits: {
            hits: [
              {
                _score: 'score 1',
                _id: 'doc id 1',
                _type: 'doc type 1',
                matched_queries: 'matched_queries 1',
                _source: {
                  random_key: 'value 1'
                }
              },
              {
                _score: 'score 2',
                _id: 'doc id 2',
                _type: 'doc type 2',
                matched_queries: 'matched_queries 2',
                _source: {
                  random_key: 'value 2'
                }
              }
            ]
          }
        };

        callback(undefined, data);

      }
    };

    const expectedDocs = [];
    const expectedMeta = { scores: [] };

    const next = (err, docs, meta) => {
      t.equals(err, null);
      t.deepEquals(docs, expectedDocs);
      t.deepEquals(meta, expectedMeta);

      t.equals(errorMessages.length, 0, 'no errors should have been logged');
      t.end();
    };

    service(esclient, 'this is the query', next);

  });

  test('esclient.search returning non-array data.hits.hits should return empty docs and meta', (t) => {
    const errorMessages = [];

    const service = proxyquire('../../../service/search', {
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

    const esclient = {
      search: (cmd, callback) => {
        t.deepEquals(cmd, 'this is the query');

        const data = {
          hits: {
            total: 17,
            hits: 'this isn\'t an array'
          }
        };

        callback(undefined, data);

      }
    };

    const expectedDocs = [];
    const expectedMeta = { scores: [] };

    const next = (err, docs, meta) => {
      t.equals(err, null);
      t.deepEquals(docs, expectedDocs);
      t.deepEquals(meta, expectedMeta);

      t.equals(errorMessages.length, 0, 'no errors should have been logged');
      t.end();
    };

    service(esclient, 'this is the query', next);

  });

};

module.exports.all = (tape, common) => {

  function test(name, testFunction) {
    return tape('SERVICE /search ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
