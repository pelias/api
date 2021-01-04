const proxyquire =  require('proxyquire').noCallThru();
const libpostal = require('../../../controller/libpostal');
const _ = require('lodash');
const mock_logger = require('pelias-mock-logger');

module.exports.tests = {};

module.exports.tests.interface = (test, common) => {
  test('valid interface', (t) => {
    t.equal(typeof libpostal, 'function', 'libpostal is a function');
    t.equal(typeof libpostal(), 'function', 'libpostal returns a controller');
    t.end();
  });
};

module.exports.tests.early_exit_conditions = (test, common) => {
  test('should_execute returning false should not call service', t => {
    const service = () => {
      t.fail('service should not have been called');
    };

    const should_execute = (req) => {
      // req and res should be passed to should_execute
      t.deepEquals(req, {
        clean: {
          text: 'original query'
        }
      });

      return false;
    };

    const controller = libpostal(service, should_execute);

    const req = {
      clean: {
        text: 'original query'
      }
    };

    controller(req, undefined, () => {
      t.deepEquals(req, {
        clean: {
          text: 'original query'
        }
      }, 'req should not have been modified');

      t.end();
    });

  });

};

module.exports.tests.error_conditions = (test, common) => {
  test('service returning error should append and not modify req.clean', t => {
    const service = (req, callback) => {
      callback('libpostal service error', []);
    };

    const controller = libpostal(service, () => true);

    const req = {
      clean: {
        text: 'original query'
      },
      errors: []
    };

    controller(req, undefined, () => {
      t.deepEquals(req, {
        clean: {
          text: 'original query'
        },
        errors: ['libpostal service error']
      }, 'req should not have been modified');

      t.end();

    });

  });

};

module.exports.tests.failure_conditions = (test, common) => {
  test('service returning 2 or more of a label should return undefined and log message', t => {
    const logger = mock_logger();

    const service = (req, callback) => {
      const response = [
        {
          label: 'road',
          value: 'road value 1'
        },
        {
          label: 'city',
          value: 'city value'
        },
        {
          label: 'road',
          value: 'road value 2'
        }
      ];

      callback(null, response);
    };

    const controller = proxyquire('../../../controller/libpostal', {
      'pelias-logger': logger
    })(service, () => true);

    const req = {
      clean: {
        text: 'query value'
      },
      errors: []
    };

    controller(req, undefined, () => {
      t.ok(logger.isWarnMessage('discarding libpostal parse of \'query value\' due to duplicate field assignments'));

      t.deepEquals(req, {
        clean: {
          text: 'query value'
        },
        errors: []
      }, 'req should not have been modified');

      t.end();

    });

  });

  test('service returning empty array should not set parsed_text or parser', t => {
    const logger = mock_logger();

    const service = (req, callback) => {
      callback(null, []);
    };

    const controller = proxyquire('../../../controller/libpostal', {
      'pelias-logger': logger
    })(service, () => true);

    const req = {
      clean: {
        text: 'query value'
      },
      errors: []
    };

    controller(req, undefined, () => {
      t.deepEquals(req, {
        clean: {
          text: 'query value'
        },
        errors: []
      }, 'req should not have been modified');

      t.end();

    });

  });

};

module.exports.tests.success_conditions = (test, common) => {
  test('service returning valid response should convert and append', t => {
    const service = (req, callback) => {
      const response = [
        {
          label: 'island',
          value: 'island value'
        },
        {
          label: 'category',
          value: 'category value'
        },
        {
          label: 'house',
          value: 'house value'
        },
        {
          label: 'house_number',
          value: 'house_number value'
        },
        {
          label: 'road',
          value: 'road value'
        },
        {
          label: 'suburb',
          value: 'suburb value'
        },
        {
          label: 'city_district',
          value: 'city_district value'
        },
        {
          label: 'city',
          value: 'city value'
        },
        {
          label: 'state_district',
          value: 'state_district value'
        },
        {
          label: 'state',
          value: 'state value'
        },
        {
          label: 'postcode',
          value: 'postcode value'
        },
        {
          label: 'country',
          value: 'country value'
        }
      ];

      callback(null, response);
    };

    const controller = libpostal(service, () => true);

    const req = {
      clean: {
        text: 'original query'
      },
      errors: []
    };

    controller(req, undefined, () => {
      t.deepEquals(req, {
        clean: {
          text: 'original query',
          parser: 'libpostal',
          parsed_text: {
            island: 'island value',
            category: 'category value',
            query: 'house value',
            housenumber: 'house_number value',
            street: 'road value',
            neighbourhood: 'suburb value',
            borough: 'city_district value',
            city: 'city value',
            county: 'state_district value',
            state: 'state value',
            postalcode: 'postcode value',
            country: 'country value'
          }
        },
        errors: []
      }, 'req should not have been modified');

      t.end();

    });

  });

  test('ISO-2 country should be converted to ISO-3', t => {
    const service = (req, callback) => {
      const response = [
        {
          label: 'country',
          value: 'ca'
        }
      ];

      callback(null, response);
    };

    const controller = libpostal(service, () => true);

    const req = {
      clean: {
        text: 'original query'
      },
      errors: []
    };

    controller(req, undefined, () => {
      t.deepEquals(req, {
        clean: {
          text: 'original query',
          parser: 'libpostal',
          parsed_text: {
            country: 'CAN'
          }
        },
        errors: []
      }, 'req should not have been modified');

      t.end();

    });

  });

};

module.exports.tests.bug_fixes = (test, common) => {
  test('bug fix: incorrect parsing of diagonal directionals - pre-directional', t => {
    const service = (req, callback) => {
      const response =[
        {
          'label': 'house_number',
          'value': '4004'
        },
        {
          'label': 'road',
          'value': 'nw'
        },
        {
          'label': 'suburb',
          'value': 'beaverton-hillsdale'
        },
        {
          'label': 'city',
          'value': 'portland'
        }
      ];

      callback(null, response);
    };

    const controller = libpostal(service, () => true);

    const req = {
      clean: {
        text: 'original query'
      },
      errors: []
    };

    controller(req, undefined, () => {
      t.deepEquals(req, {
        clean: {
          text: 'original query',
          parser: 'libpostal',
          parsed_text: {
            housenumber: '4004',
            street: 'nw beaverton-hillsdale',
            city: 'portland'
          }
        },
        errors: []
      }, 'req should not have been modified');

      t.end();

    });

  });

  test('bug fix: incorrect parsing of diagonal directionals - post-directional', t => {
    const service = (req, callback) => {
      // 1125 Couch St NW, Portland
      const response = [
        {
          'label': 'house_number',
          'value': '1125'
        },
        {
          'label': 'road',
          'value': 'couch st'
        },
        {
          'label': 'suburb',
          'value': 'nw'
        },
        {
          'label': 'city',
          'value': 'portland'
        }
      ];

      callback(null, response);
    };

    const controller = libpostal(service, () => true);

    const req = {
      clean: {
        text: 'original query'
      },
      errors: []
    };

    controller(req, undefined, () => {
      t.deepEquals(req, {
        clean: {
          text: 'original query',
          parser: 'libpostal',
          parsed_text: {
            housenumber: '1125',
            street: 'couch st nw',
            city: 'portland'
          }
        },
        errors: []
      }, 'req should not have been modified');

      t.end();

    });

  });

  test('bug fix: incorrect parsing of diagonal directionals - no subsequent element', t => {
    const service = (req, callback) => {
      const response = [
        {
          'label': 'test',
          'value': 'test'
        },
        {
          'label': 'road',
          'value': 'nw'
        }
      ];

      callback(null, response);
    };

    const controller = libpostal(service, () => true);

    const req = {
      clean: {
        text: 'original query'
      },
      errors: []
    };

    controller(req, undefined, () => {
      t.deepEquals(req, {
        clean: {
          text: 'original query',
          parser: 'libpostal',
          parsed_text: {
            street: 'nw'
          }
        },
        errors: []
      }, 'req should not have been modified');

      t.end();

    });

  });

  test('bug fix: recast label for "zoo" from borough/city_district to house', t => {
    const service = (req, callback) => {
      const response = [
        {
          'label': 'city_district',
          'value': 'zoo'
        }
      ];

      callback(null, response);
    };

    const controller = libpostal(service, () => true);

    const req = {
      clean: {
        text: 'original query'
      },
      errors: []
    };

    controller(req, undefined, () => {
      t.deepEquals(req, {
        clean: {
          text: 'original query',
          parser: 'libpostal',
          parsed_text: {
            query: 'zoo'
          }
        },
        errors: []
      }, 'req should not have been modified');

      t.end();

    });

  });

  test('bug fix: correctly parse australian-style unit numbers', t => {
    const service = (req, callback) => {
      const response = [
        {
          'label': 'house_number',
          'value': '11/1015'
        },
        {
          'label': 'road',
          'value': 'nudgee road'
        },
        {
          'label': 'suburb',
          'value': 'banyo'
        },
        {
          'label': 'postcode',
          'value': '4014'
        },
        {
          'label': 'state',
          'value': 'qld'
        }
      ];

      callback(null, response);
    };

    const controller = libpostal(service, () => true);

    const req = {
      clean: {
        text: 'original query'
      },
      errors: []
    };

    controller(req, undefined, () => {
      t.deepEquals(req, {
        clean: {
          text: 'original query',
          parser: 'libpostal',
          parsed_text: {
            unit: '11',
            housenumber: '1015',
            street: 'nudgee road',
            neighbourhood: 'banyo',
            postalcode: '4014',
            state: 'qld'
          }
        },
        errors: []
      }, 'req should not have been modified');

      t.end();

    });

  });

  test('bug fix: correctly parse australian-style unit numbers - with plus', t => {
    const service = (req, callback) => {
      const response = [
        {
          'label': 'house_number',
          'value': '2+3/32'
        },
        {
          'label': 'road',
          'value': 'dixon street'
        },
        {
          'label': 'suburb',
          'value': 'strathpine'
        },
        {
          'label': 'postcode',
          'value': '4500'
        },
        {
          'label': 'state',
          'value': 'qld'
        }
      ];

      callback(null, response);
    };

    const controller = libpostal(service, () => true);

    const req = {
      clean: {
        text: 'original query'
      },
      errors: []
    };

    controller(req, undefined, () => {
      t.deepEquals(req, {
        clean: {
          text: 'original query',
          parser: 'libpostal',
          parsed_text: {
            unit: '2+3',
            housenumber: '32',
            street: 'dixon street',
            neighbourhood: 'strathpine',
            postalcode: '4500',
            state: 'qld'
          }
        },
        errors: []
      }, 'req should not have been modified');

      t.end();

    });

  });

  test('bug fix: correctly parse australian-style unit numbers - with unit spelled out', t => {
    const service = (req, callback) => {
      const response = [
        {
          'label': 'house_number',
          'value': 'unit 3 /30'
        },
        {
          'label': 'road',
          'value': 'dan rees street'
        },
        {
          'label': 'suburb',
          'value': 'wallsend'
        },
        {
          'label': 'postcode',
          'value': '2287'
        },
        {
          'label': 'state',
          'value': 'nsw'
        }
      ];

      callback(null, response);
    };

    const controller = libpostal(service, () => true);

    const req = {
      clean: {
        text: 'original query'
      },
      errors: []
    };

    controller(req, undefined, () => {
      t.deepEquals(req, {
        clean: {
          text: 'original query',
          parser: 'libpostal',
          parsed_text: {
            unit: 'unit 3',
            housenumber: '30',
            street: 'dan rees street',
            neighbourhood: 'wallsend',
            postalcode: '2287',
            state: 'nsw'
          }
        },
        errors: []
      }, 'req should not have been modified');

      t.end();

    });

  });

  test('bug fix: correctly parse australian-style unit numbers - no-op if "unit" already assigned', t => {
    const service = (req, callback) => {
      const response = [
        {
          'label': 'unit',
          'value': '99'
        },
        {
          'label': 'house_number',
          'value': '11/1015'
        },
        {
          'label': 'road',
          'value': 'nudgee road'
        },
        {
          'label': 'suburb',
          'value': 'banyo'
        },
        {
          'label': 'postcode',
          'value': '4014'
        },
        {
          'label': 'state',
          'value': 'qld'
        }
      ];

      callback(null, response);
    };

    const controller = libpostal(service, () => true);

    const req = {
      clean: {
        text: 'original query'
      },
      errors: []
    };

    controller(req, undefined, () => {
      t.deepEquals(req, {
        clean: {
          text: 'original query',
          parser: 'libpostal',
          parsed_text: {
            unit: '99',
            housenumber: '11/1015',
            street: 'nudgee road',
            neighbourhood: 'banyo',
            postalcode: '4014',
            state: 'qld'
          }
        },
        errors: []
      }, 'req should not have been modified');

      t.end();

    });

  });

  test('bug fix: recast entirely numeric input - 9', t => {
    const service = (req, callback) => {
      callback(null, [{
        'label': 'city',
        'value': '9'
      }]);
    };
    const controller = libpostal(service, () => true);
    const req = {
      clean: {
        text: '9'
      },
      errors: []
    };
    controller(req, undefined, () => {
      t.deepEquals(req, {
        clean: {
          text: '9',
          parser: 'libpostal',
          parsed_text: {
            query: '9'
          }
        },
        errors: []
      }, 'req should not have been modified');

      t.end();
    });
  });

  test('bug fix: recast entirely numeric input - 99', t => {
    const service = (req, callback) => {
      callback(null, [{
        'label': 'suburb',
        'value': '99'
      }]);
    };
    const controller = libpostal(service, () => true);
    const req = {
      clean: {
        text: '99'
      },
      errors: []
    };
    controller(req, undefined, () => {
      t.deepEquals(req, {
        clean: {
          text: '99',
          parser: 'libpostal',
          parsed_text: {
            query: '99'
          }
        },
        errors: []
      }, 'req should not have been modified');

      t.end();
    });
  });

  test('bug fix: do not skip parse if there are more than one numeric label', t => {
    const service = (req, callback) => {
      callback(null, [{
        'label': 'city',
        'value': '9'
      },{
        'label': 'suburb',
        'value': '99'
      }]);
    };
    const controller = libpostal(service, () => true);
    const req = {
      clean: {
        text: '9 99'
      },
      errors: []
    };
    controller(req, undefined, () => {
      t.deepEquals(req, {
        clean: {
          text: '9 99',
          parser: 'libpostal',
          parsed_text: {
            city: '9',
            neighbourhood: '99'
          }
        },
        errors: []
      }, 'req should not have been modified');

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
