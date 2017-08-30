'use strict';

const proxyquire =  require('proxyquire').noCallThru();
const _ = require('lodash');

module.exports.tests = {};

module.exports.tests.interface = (test, common) => {
  test('valid interface', t => {
    const controller = proxyquire('../../../controller/libpostal', {
      'pelias-text-analyzer': {
        parse: () => undefined
      }
    });

    t.equal(typeof controller, 'function', 'libpostal is a function');
    t.equal(typeof controller(), 'function', 'libpostal returns a controller');
    t.end();

  });

};

module.exports.tests.should_execute = (test, common) => {
  test('should_execute returning false should not call text-analyzer', t => {
    const should_execute = (req, res) => {
      // req and res should be passed to should_execute
      t.deepEquals(req, {
        clean: {
          text: 'original query'
        }
      });
      t.deepEquals(res, { b: 2 });
      return false;
    };

    const controller = proxyquire('../../../controller/libpostal', {
      'pelias-text-analyzer': {
        parse: () => {
          t.fail('parse should not have been called');
        }
      }
    })(should_execute);

    const req = {
      clean: {
        text: 'original query'
      }
    };
    const res = { b: 2 };

    controller(req, res, () => {
      t.deepEquals(req, {
        clean: {
          text: 'original query'
        }
      }, 'req should not have been modified');
      t.deepEquals(res, { b: 2 });
      t.end();
    });

  });

  test('should_execute returning false should not call text-analyzer', t => {
    t.plan(5);

    const should_execute = (req, res) => {
      // req and res should be passed to should_execute
      t.deepEquals(req, {
        clean: {
          text: 'original query'
        }
      });
      t.deepEquals(res, { b: 2 });
      return true;
    };

    const controller = proxyquire('../../../controller/libpostal', {
      'pelias-text-analyzer': {
        parse: (query) => {
          t.equals(query, 'original query');
          return undefined;
        }
      }
    })(should_execute);

    const req = {
      clean: {
        text: 'original query'
      }
    };
    const res = { b: 2 };

    controller(req, res, () => {
      t.deepEquals(req, {
        clean: {
          text: 'original query'
        }
      }, 'req should not have been modified');
      t.deepEquals(res, { b: 2 });
      t.end();
    });

  });

};

module.exports.tests.parse_is_called = (test, common) => {
  test('parse returning undefined should not overwrite clean.parsed_text', t => {
    const controller = proxyquire('../../../controller/libpostal', {
      'pelias-text-analyzer': {
        parse: () => undefined
      }
    })(() => true);

    const req = {
      clean: {
        parsed_text: 'original parsed_text'
      }
    };
    const res = 'this is the response';

    controller(req, res, () => {
      t.deepEquals(req, {
        clean: {
          parsed_text: 'original parsed_text'
        }
      });
      t.deepEquals(res, 'this is the response');
      t.end();
    });

  });

  test('parse returning something should overwrite clean.parsed_text', t => {
    const controller = proxyquire('../../../controller/libpostal', {
      'pelias-text-analyzer': {
        parse: () => 'replacement parsed_text'
      }
    })(() => true);

    const req = {
      clean: {
        parsed_text: 'original parsed_text'
      }
    };
    const res = 'this is the response';

    controller(req, res, () => {
      t.deepEquals(req, {
        clean: {
          parsed_text: 'replacement parsed_text'
        }
      });
      t.deepEquals(res, 'this is the response');
      t.end();
    });

  });

};

module.exports.tests.iso2_conversion = (test, common) => {
  test('no country in parse response should not leave country unset', t => {
    const controller = proxyquire('../../../controller/libpostal', {
      'pelias-text-analyzer': {
        parse: () => ({
          locality: 'this is the locality'
        })
      },
      'iso3166-1': {
        is2: () => t.fail('should not have been called'),
        to3: () => t.fail('should not have been called')
      }
    })(() => true);

    const req = {
      clean: {
        parsed_text: 'original parsed_text'
      }
    };
    const res = 'this is the response';

    controller(req, res, () => {
      t.deepEquals(req, {
        clean: {
          parsed_text: {
            locality: 'this is the locality'
          }
        }
      });
      t.deepEquals(res, 'this is the response');
      t.end();
    });

  });

  test('unknown country should not be converted', t => {
    t.plan(3);

    const controller = proxyquire('../../../controller/libpostal', {
      'pelias-text-analyzer': {
        parse: () => ({
          country: 'unknown country code'
        })
      },
      'iso3166-1': {
        is2: country => {
          t.equals(country, 'UNKNOWN COUNTRY CODE');
          return false;
        },
        to3: () => t.fail('should not have been called')
      }
    })(() => true);

    const req = {
      clean: {
        parsed_text: 'original parsed_text'
      }
    };
    const res = 'this is the response';

    controller(req, res, () => {
      t.deepEquals(req, {
        clean: {
          parsed_text: {
            country: 'unknown country code'
          }
        }
      });
      t.deepEquals(res, 'this is the response');
      t.end();
    });

  });

  test('ISO2 country should be converted to ISO3', t => {
    t.plan(4);

    const controller = proxyquire('../../../controller/libpostal', {
      'pelias-text-analyzer': {
        parse: () => ({
          country: 'ISO2 COUNTRY CODE'
        })
      },
      'iso3166-1': {
        is2: country => {
          t.equals(country, 'ISO2 COUNTRY CODE');
          return true;
        },
        to3: country => {
          t.equals(country, 'ISO2 COUNTRY CODE');
          return 'ISO3 COUNTRY CODE';
        }
      }
    })(() => true);

    const req = {
      clean: {
        parsed_text: 'original parsed_text'
      }
    };
    const res = 'this is the response';

    controller(req, res, () => {
      t.deepEquals(req, {
        clean: {
          parsed_text: {
            country: 'ISO3 COUNTRY CODE'
          }
        }
      });
      t.deepEquals(res, 'this is the response');
      t.end();
    });

  });

};

module.exports.all = (tape, common) => {

  function test(name, testFunction) {
    return tape(`GET /libpostal ${name}`, testFunction);
  }

  for( const testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
