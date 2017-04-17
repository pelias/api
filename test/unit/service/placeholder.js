const proxyquire = require('proxyquire').noCallThru();
const express = require('express');

const setup = require('../../../service/placeholder');

module.exports.tests = {};

module.exports.tests.interface = (test, common) => {
  test('valid interface', (t) => {
    const logger = require('pelias-mock-logger')();

    var service = proxyquire('../../../service/placeholder', {
      'pelias-logger': logger
    });

    t.equal(typeof service, 'function', 'service is a function');
    t.end();
  });
};

module.exports.tests.do_nothing_service = (test, common) => {
  test('undefined url should return service that logs fact that placeholder service is not available', (t) => {
    const logger = require('pelias-mock-logger')();

    const service = proxyquire('../../../service/placeholder', {
      'pelias-logger': logger
    })();

    service.search('search text', 'search lang', (err) => {
      t.deepEquals(logger.getWarnMessages(), [
        'placeholder service disabled'
      ]);
      t.equals(err, 'placeholder service disabled');
      t.end();
    });

  });

};

module.exports.tests.failure_conditions = (test, common) => {
  test('server returning error should log it and return no results', (t) => {
    const server = express().listen();
    const port = server.address().port;

    // immediately close the server so to ensure an error response
    server.close();

    const logger = require('pelias-mock-logger')();

    const service = proxyquire('../../../service/placeholder', {
      'pelias-logger': logger
    })(`http://localhost:${port}`);

    service.search('search text', 'search lang', (err, results) => {
      t.equals(err.code, 'ECONNREFUSED');
      t.notOk(results);
      t.ok(logger.isErrorMessage(/ECONNREFUSED/), 'there should be a connection refused error message');
      t.end();

      server.close();

    });

  });

  test('server returning non-200 response should log error and return no results', (t) => {
    const placeholderServer = express();
    placeholderServer.get('/search', (req, res, next) => {
      res.status(400).send('a bad request was made');
    });

    const server = placeholderServer.listen();
    const port = server.address().port;

    const logger = require('pelias-mock-logger')();

    const service = proxyquire('../../../service/placeholder', {
      'pelias-logger': logger
    })(`http://localhost:${port}`);

    service.search('search text', 'search lang', (err, results) => {
      t.equals(err, `http://localhost:${port}/search?text=search%20text&lang=search%20lang returned status 400: a bad request was made`);
      t.notOk(results);
      t.ok(logger.isErrorMessage(`http://localhost:${port}/search?text=search%20text&lang=search%20lang ` +
        `returned status 400: a bad request was made`));
      t.end();

      server.close();

    });

  });

  test('server returning 404 statusCode should be treated the same as other statusCodes', (t) => {
    // at one point placeholder treated 0 results as a 404 instead of just an unparseable input
    const placeholderServer = express();
    placeholderServer.get('/search', (req, res, next) => {
      res.status(404).send('resource not found');
    });

    const server = placeholderServer.listen();
    const port = server.address().port;

    const logger = require('pelias-mock-logger')();

    const service = proxyquire('../../../service/placeholder', {
      'pelias-logger': logger
    })(`http://localhost:${port}`);

    service.search('search text', 'search lang', (err, results) => {
      t.equals(err, `http://localhost:${port}/search?text=search%20text&lang=search%20lang returned status 404: resource not found`);
      t.notOk(results);
      t.ok(logger.isErrorMessage(`http://localhost:${port}/search?text=search%20text&lang=search%20lang ` +
        `returned status 404: resource not found`));
      t.end();

      server.close();

    });

  });

  test('server returning 200 statusCode but with non-JSON response should log error and return undefined', (t) => {
    const placeholderServer = express();
    placeholderServer.get('/search', (req, res, next) => {
      res.status(200).send('this is not parseable as JSON');
    });

    const server = placeholderServer.listen();
    const port = server.address().port;

    const logger = require('pelias-mock-logger')();

    const service = proxyquire('../../../service/placeholder', {
      'pelias-logger': logger
    })(`http://localhost:${port}`);

    service.search('search text', 'search lang', (err, results) => {
      t.equals(err, `http://localhost:${port}/search?text=search%20text&lang=search%20lang ` +
        `could not parse response: this is not parseable as JSON`);
      t.notOk(results, 'should return undefined');
      t.ok(logger.isErrorMessage(`http://localhost:${port}/search?text=search%20text&lang=search%20lang ` +
        `could not parse response: this is not parseable as JSON`));
      t.end();

      server.close();

    });

  });

};

module.exports.tests.success_conditions = (test, common) => {
  test('server returning statusCode 200 should return no error and parsed output', (t) => {
    const placeholderServer = express();
    placeholderServer.get('/search', (req, res, next) => {
      if (req.query.text === 'search text' && req.query.lang === 'search lang') {
        res.status(200).send('[1, 2, 3]');
      }
    });

    const server = placeholderServer.listen();
    const port = server.address().port;

    const logger = require('pelias-mock-logger')();

    const service = proxyquire('../../../service/placeholder', {
      'pelias-logger': logger
    })(`http://localhost:${port}`);

    service.search('search text', 'search lang', (err, results) => {
      t.notOk(err, 'should be no error');
      t.deepEquals(results, [1, 2, 3]);
      t.notOk(logger.hasErrorMessages());
      t.end();

      server.close();

    });

  });

};

module.exports.all = (tape, common) => {
  function test(name, testFunction) {
    return tape(`SERVICE /placeholder ${name}`, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
