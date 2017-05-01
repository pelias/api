const proxyquire = require('proxyquire').noCallThru();
const express = require('express');

const setup = require('../../../service/http_json');

module.exports.tests = {};

module.exports.tests.interface = (test, common) => {
  test('valid interface', (t) => {
    const logger = require('pelias-mock-logger')();

    var service = proxyquire('../../../service/http_json', {
      'pelias-logger': logger
    });

    t.equal(typeof service, 'function', 'service is a function');
    t.end();
  });
};

module.exports.tests.conforms_to = (test, common) => {
  test('serviceConfig with non-function getName property should throw error', (t) => {
    const serviceConfig = {
      getName: 'this is not a function',
      getBaseUrl: () => {},
      getUrl: () => {},
      getParameters: () => {},
      getHeaders: () => {}
    };

    t.throws(setup.bind(null, serviceConfig), /serviceConfig should have a bunch of functions exposed/);
    t.end();

  });

  test('serviceConfig with non-function getBaseUrl property should throw error', (t) => {
    const serviceConfig = {
      getName: () => {},
      getBaseUrl: 'this is not a function',
      getUrl: () => {},
      getParameters: () => {},
      getHeaders: () => {}
    };

    t.throws(setup.bind(null, serviceConfig), /serviceConfig should have a bunch of functions exposed/);
    t.end();

  });

  test('serviceConfig with non-function getUrl property should throw error', (t) => {
    const serviceConfig = {
      getName: () => {},
      getBaseUrl: () => {},
      getUrl: 'this is not a function',
      getParameters: () => {},
      getHeaders: () => {}
    };

    t.throws(setup.bind(null, serviceConfig), /serviceConfig should have a bunch of functions exposed/);
    t.end();

  });

  test('serviceConfig with non-function getParameters property should throw error', (t) => {
    const serviceConfig = {
      getName: () => {},
      getBaseUrl: () => {},
      getUrl: () => {},
      getParameters: 'this is not a function',
      getHeaders: () => {}
    };

    t.throws(setup.bind(null, serviceConfig), /serviceConfig should have a bunch of functions exposed/);
    t.end();

  });

  test('serviceConfig with non-function getHeaders property should throw error', (t) => {
    const serviceConfig = {
      getName: () => {},
      getBaseUrl: () => {},
      getUrl: () => {},
      getParameters: () => {},
      getHeaders: 'this is not a function'
    };

    t.throws(setup.bind(null, serviceConfig), /serviceConfig should have a bunch of functions exposed/);
    t.end();

  });

};

module.exports.tests.do_nothing_service = (test, common) => {
  test('undefined config.url should return service that logs that config.name service is not available', (t) => {
    const logger = require('pelias-mock-logger')();

    const serviceConfig = {
      getName: () => { return 'foo'; },
      getBaseUrl: () => {
        return undefined;
      },
      getUrl: () => { return undefined; },
      getParameters: (req) => {},
      getHeaders: (req) => {}
    };

    const service = proxyquire('../../../service/http_json', {
      'pelias-logger': logger
    })(serviceConfig);

    t.ok(logger.isWarnMessage(/^foo service disabled$/));

    service({}, (err) => {
      t.equals(err, 'foo service disabled');
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

    const serviceConfig = {
      getName: () => { return 'foo'; },
      getBaseUrl: () => { return `http://localhost:${port}`; },
      getUrl: (req) => { return `http://localhost:${port}/built_url`; },
      getParameters: (req) => { return { param1: 'param1 value', param2: 'param2 value' }; },
      getHeaders: (req) => { return { header1: 'header1 value' }; }
    };

    const service = proxyquire('../../../service/http_json', {
      'pelias-logger': logger
    })(serviceConfig);

    t.ok(logger.isInfoMessage(new RegExp(`using foo service at http://localhost:${port}`)));

    service({}, (err, results) => {
      t.equals(err.code, 'ECONNREFUSED');
      t.notOk(results);
      t.ok(logger.isErrorMessage(new RegExp(`^http://localhost:${port}/built_url: .*ECONNREFUSED`)),
        'there should be a connection refused error message');
      t.end();

      server.close();

    });

  });

  test('[DNT] server returning error should log it w/sanitized URL and return no results', (t) => {
    const server = express().listen();
    const port = server.address().port;

    // immediately close the server so to ensure an error response
    server.close();

    const logger = require('pelias-mock-logger')();

    const serviceConfig = {
      getName: () => { return 'foo'; },
      getBaseUrl: () => { return `http://localhost:${port}`; },
      getUrl: (req) => { return `http://localhost:${port}/built_url`; },
      getParameters: (req) => { return { param1: 'param1 value', param2: 'param2 value' }; },
      getHeaders: (req) => { return { header1: 'header1 value' }; }
    };

    const service = proxyquire('../../../service/http_json', {
      'pelias-logger': logger,
      '../helper/logging': {
        isDNT: () => { return true; }
      }
    })(serviceConfig);

    t.ok(logger.isInfoMessage(new RegExp(`using foo service at http://localhost:${port}`)));

    service({}, (err, results) => {
      t.equals(err.code, 'ECONNREFUSED');
      t.notOk(results);
      t.ok(logger.isErrorMessage(new RegExp(`^http://localhost:${port} \\[do_not_track\\]: .*ECONNREFUSED`)),
        'there should be a connection refused error message');
      t.end();

      server.close();

    });

  });

  test('server returning non-200 response should log error and return no results', (t) => {
    const webServer = express();
    webServer.get('/some_endpoint', (req, res, next) => {
      t.notOk(req.headers.hasOwnProperty('dnt'), 'dnt header should not have been passed');

      t.equals(req.headers.header1, 'header1 value', 'all headers should have been passed');
      t.deepEquals(req.query, { param1: 'param1 value', param2: 'param2 value' });

      res.status(400).send('a bad request was made');
    });

    const server = webServer.listen();
    const port = server.address().port;

    const logger = require('pelias-mock-logger')();

    const serviceConfig = {
      getName: () => { return 'foo'; },
      getBaseUrl: () => { return `http://localhost:${port}`; },
      getUrl: (req) => { return `http://localhost:${port}/some_endpoint`; },
      getParameters: (req) => { return { param1: 'param1 value', param2: 'param2 value' }; },
      getHeaders: (req) => { return { header1: 'header1 value' }; }
    };

    const service = proxyquire('../../../service/http_json', {
      'pelias-logger': logger
    })(serviceConfig);

    t.ok(logger.isInfoMessage(new RegExp(`using foo service at http://localhost:${port}`)));

    service({}, (err, results) => {
      t.equals(err, `http://localhost:${port}/some_endpoint?param1=param1%20value&param2=param2%20value ` +
        'returned status 400: a bad request was made');
      t.notOk(results);
      t.ok(logger.isErrorMessage(`http://localhost:${port}/some_endpoint?param1=param1%20value&param2=param2%20value ` +
        `returned status 400: a bad request was made`));
      t.end();

      server.close();

    });

  });

  test('[DNT] server returning non-200 response should log sanitized error and return no results', (t) => {
    const webServer = express();
    webServer.get('/some_endpoint', (req, res, next) => {
      t.equals(req.headers.dnt, '1');

      t.equals(req.headers.header1, 'header1 value', 'all headers should have been passed');
      t.deepEquals(req.query, { param1: 'param1 value', param2: 'param2 value' });

      res.status(400).send('a bad request was made');
    });

    const server = webServer.listen();
    const port = server.address().port;

    const logger = require('pelias-mock-logger')();

    const serviceConfig = {
      getName: () => { return 'foo'; },
      getBaseUrl: () => { return `http://localhost:${port}`; },
      getUrl: (req) => { return `http://localhost:${port}/some_endpoint`; },
      getParameters: (req) => { return { param1: 'param1 value', param2: 'param2 value' }; },
      getHeaders: (req) => { return { header1: 'header1 value' }; }
    };

    const service = proxyquire('../../../service/http_json', {
      'pelias-logger': logger,
      '../helper/logging': {
        isDNT: () => { return true; }
      }
    })(serviceConfig);

    t.ok(logger.isInfoMessage(new RegExp(`using foo service at http://localhost:${port}`)));

    service({}, (err, results) => {
      t.equals(err, `http://localhost:${port} [do_not_track] returned status 400: a bad request was made`);
      t.notOk(results);
      t.ok(logger.isErrorMessage(`http://localhost:${port} [do_not_track] ` +
        `returned status 400: a bad request was made`));
      t.end();

      server.close();

    });

  });

  test('server returning 200 statusCode but with non-JSON response should log error and return undefined', (t) => {
    const webServer = express();
    webServer.get('/some_endpoint', (req, res, next) => {
      t.notOk(req.headers.hasOwnProperty('dnt'), 'dnt header should not have been passed');

      t.equals(req.headers.header1, 'header1 value', 'all headers should have been passed');
      t.deepEquals(req.query, { param1: 'param1 value', param2: 'param2 value' });

      res.status(200).send('this is not parseable as JSON');
    });

    const server = webServer.listen();
    const port = server.address().port;

    const logger = require('pelias-mock-logger')();

    const serviceConfig = {
      getName: () => { return 'foo'; },
      getBaseUrl: () => { return `http://localhost:${port}`; },
      getUrl: (req) => { return `http://localhost:${port}/some_endpoint`; },
      getParameters: (req) => { return { param1: 'param1 value', param2: 'param2 value' }; },
      getHeaders: (req) => { return { header1: 'header1 value' }; }
    };

    const service = proxyquire('../../../service/http_json', {
      'pelias-logger': logger
    })(serviceConfig);

    t.ok(logger.isInfoMessage(new RegExp(`using foo service at http://localhost:${port}`)));

    service({}, (err, results) => {
      t.equals(err, `http://localhost:${port}/some_endpoint?param1=param1%20value&param2=param2%20value ` +
        `could not parse response: this is not parseable as JSON`);
      t.notOk(results, 'should return undefined');
      t.ok(logger.isErrorMessage(`http://localhost:${port}/some_endpoint?param1=param1%20value&param2=param2%20value ` +
        `could not parse response: this is not parseable as JSON`));
      t.end();

      server.close();

    });

  });

  test('[DNT] server returning 200 statusCode but with non-JSON response should log sanitized error and return undefined', (t) => {
    const webServer = express();
    webServer.get('/some_endpoint', (req, res, next) => {
      t.equals(req.headers.dnt, '1');

      t.equals(req.headers.header1, 'header1 value', 'all headers should have been passed');
      t.deepEquals(req.query, { param1: 'param1 value', param2: 'param2 value' });

      res.status(200).send('this is not parseable as JSON');
    });

    const server = webServer.listen();
    const port = server.address().port;

    const logger = require('pelias-mock-logger')();

    const serviceConfig = {
      getName: () => { return 'foo'; },
      getBaseUrl: () => { return `http://localhost:${port}`; },
      getUrl: (req) => { return `http://localhost:${port}/some_endpoint`; },
      getParameters: (req) => { return { param1: 'param1 value', param2: 'param2 value' }; },
      getHeaders: (req) => { return { header1: 'header1 value' }; }
    };

    const service = proxyquire('../../../service/http_json', {
      'pelias-logger': logger,
      '../helper/logging': {
        isDNT: () => { return true; }
      }
    })(serviceConfig);

    t.ok(logger.isInfoMessage(new RegExp(`using foo service at http://localhost:${port}`)));

    service({}, (err, results) => {
      t.equals(err, `http://localhost:${port} [do_not_track] ` +
        `could not parse response: this is not parseable as JSON`);
      t.notOk(results, 'should return undefined');
      t.ok(logger.isErrorMessage(`http://localhost:${port} [do_not_track] ` +
        `could not parse response: this is not parseable as JSON`));
      t.end();

      server.close();

    });

  });

};

module.exports.tests.success_conditions = (test, common) => {
  test('server returning statusCode 200 should return no error and parsed output', (t) => {
    const webServer = express();
    webServer.get('/some_endpoint', (req, res, next) => {
      t.notOk(req.headers.hasOwnProperty('dnt'), 'dnt header should not have been passed');

      t.equals(req.headers.header1, 'header1 value', 'all headers should have been passed');
      t.deepEquals(req.query, { param1: 'param1 value', param2: 'param2 value' });

      res.status(200).send('[1, 2, 3]');
    });

    const server = webServer.listen();
    const port = server.address().port;

    const logger = require('pelias-mock-logger')();

    const serviceConfig = {
      getName: () => { return 'foo'; },
      getBaseUrl: () => { return `http://localhost:${port}`; },
      getUrl: (req) => { return `http://localhost:${port}/some_endpoint`; },
      getParameters: (req) => { return { param1: 'param1 value', param2: 'param2 value' }; },
      getHeaders: (req) => { return { header1: 'header1 value' }; }
    };

    const service = proxyquire('../../../service/http_json', {
      'pelias-logger': logger
    })(serviceConfig);

    t.ok(logger.isInfoMessage(new RegExp(`using foo service at http://localhost:${port}`)));

    service({}, (err, results) => {
      t.notOk(err, 'should be no error');
      t.deepEquals(results, [1, 2, 3]);
      t.notOk(logger.hasErrorMessages());
      t.end();

      server.close();

    });

  });

  test('getHeaders returning undefined should use empty headers object', (t) => {
    const webServer = express();
    webServer.get('/some_endpoint', (req, res, next) => {
      t.equals(req.headers.dnt, '1');

      t.deepEquals(req.query, { param1: 'param1 value', param2: 'param2 value' });

      res.status(200).send('[1, 2, 3]');
    });

    const server = webServer.listen();
    const port = server.address().port;

    const logger = require('pelias-mock-logger')();

    const serviceConfig = {
      getName: () => { return 'foo'; },
      getBaseUrl: () => { return `http://localhost:${port}`; },
      getUrl: (req) => { return `http://localhost:${port}/some_endpoint`; },
      getParameters: (req) => { return { param1: 'param1 value', param2: 'param2 value' }; },
      getHeaders: (req) => { }
    };

    const service = proxyquire('../../../service/http_json', {
      'pelias-logger': logger,
      '../helper/logging': {
        isDNT: () => { return true; }
      }
    })(serviceConfig);

    t.ok(logger.isInfoMessage(new RegExp(`using foo service at http://localhost:${port}`)));

    service({}, (err, results) => {
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
    return tape(`SERVICE /http_json ${name}`, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
