const proxyquire = require('proxyquire').noCallThru();

const setup = require('../../../service/pointinpolygon');

module.exports.tests = {};

module.exports.tests.interface = (test, common) => {
  test('valid interface', (t) => {
    const logger = require('pelias-mock-logger')();

    var service = proxyquire('../../../service/pointinpolygon', {
      'pelias-logger': logger
    });

    t.equal(typeof service, 'function', 'service is a function');
    t.end();
  });
};

module.exports.tests.do_nothing_service = (test, common) => {
  test('undefined PiP uri should return service that logs fact that PiP service is not available', (t) => {
    const logger = require('pelias-mock-logger')();

    const service = proxyquire('../../../service/pointinpolygon', {
      'pelias-logger': logger
    })();

    service({ lat: 12.121212, lon: 21.212121 }, (err) => {
      t.deepEquals(logger.getWarnMessages(), [
        'point-in-polygon service disabled'
      ]);
      t.equals(err, 'point-in-polygon service disabled, unable to resolve {"lat":12.121212,"lon":21.212121}');
      t.end();
    });

  });

};

module.exports.tests.success = (test, common) => {
  test('lat and lon should be passed to server', (t) => {
    const pipServer = require('express')();
    pipServer.get('/:lon/:lat', (req, res, next) => {
      t.equals(req.params.lat, '12.121212');
      t.equals(req.params.lon, '21.212121');

      res.send('{ "field": "value" }');
    });

    const server = pipServer.listen();
    const port = server.address().port;

    const logger = require('pelias-mock-logger')();

    const service = proxyquire('../../../service/pointinpolygon', {
      'pelias-logger': logger
    })(`http://localhost:${port}`);

    service({ lat: 12.121212, lon: 21.212121}, (err, results) => {
      t.notOk(err);
      t.deepEquals(results, { field: 'value' });

      t.ok(logger.isInfoMessage(`using point-in-polygon service at http://localhost:${port}`));
      t.notOk(logger.hasErrorMessages());
      
      t.end();

      server.close();

    });

  });

};

module.exports.tests.failure = (test, common) => {
  test('server returning success but non-JSON body should log error and return no results', (t) => {
    const pipServer = require('express')();
    pipServer.get('/:lon/:lat', (req, res, next) => {
      t.equals(req.params.lat, '12.121212');
      t.equals(req.params.lon, '21.212121');

      res.send('this is not JSON');
    });

    const server = pipServer.listen();
    const port = server.address().port;

    const logger = require('pelias-mock-logger')();

    const service = proxyquire('../../../service/pointinpolygon', {
      'pelias-logger': logger
    })(`http://localhost:${port}`);

    service({ lat: 12.121212, lon: 21.212121}, (err, results) => {
      t.equals(err, `http://localhost:${port}/21.212121/12.121212 returned status 200 but with non-JSON response: this is not JSON`);
      t.notOk(results);
      t.ok(logger.isErrorMessage(`http://localhost:${port}/21.212121/12.121212: could not parse response body: this is not JSON`));
      t.end();

      server.close();

    });

  });

  test('server returning error should log it and return no results', (t) => {
    const server = require('express')().listen();
    const port = server.address().port;

    // immediately close the server so to ensure an error response
    server.close();

    const logger = require('pelias-mock-logger')();

    const service = proxyquire('../../../service/pointinpolygon', {
      'pelias-logger': logger
    })(`http://localhost:${port}`);

    service({ lat: 12.121212, lon: 21.212121}, (err, results) => {
      t.equals(err.code, 'ECONNREFUSED');
      t.notOk(results);
      t.ok(logger.isErrorMessage(/ECONNREFUSED/), 'there should be a connection refused error message');
      t.end();

      server.close();

    });

  });

  test('non-OK status should log error and return no results', (t) => {
    const pipServer = require('express')();
    pipServer.get('/:lat/:lon', (req, res, next) => {
      res.status(400).send('a bad request was made');
    });

    const server = pipServer.listen();
    const port = server.address().port;

    const logger = require('pelias-mock-logger')();

    const service = proxyquire('../../../service/pointinpolygon', {
      'pelias-logger': logger
    })(`http://localhost:${port}`);

    service({ lat: 12.121212, lon: 21.212121}, (err, results) => {
      t.equals(err, `http://localhost:${port}/21.212121/12.121212 returned status 400: a bad request was made`);
      t.notOk(results);
      t.ok(logger.isErrorMessage(`http://localhost:${port}/21.212121/12.121212 returned status 400: a bad request was made`));
      t.end();

      server.close();

    });

  });

};

module.exports.all = (tape, common) => {
  function test(name, testFunction) {
    return tape(`SERVICE /pointinpolygon ${name}`, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
