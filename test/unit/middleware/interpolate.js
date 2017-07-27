'use strict';

const setup = require('../../../middleware/interpolate');
const proxyquire =  require('proxyquire').noCallThru();
const _  = require('lodash');

module.exports.tests = {};

module.exports.tests.interface = (test, common) => {
  test('valid interface', t => {
    t.equal(typeof setup, 'function', 'setup is a function');
    t.equal(typeof setup(), 'function', 'setup returns a controller');
    t.end();
  });
};

module.exports.tests.early_exit_conditions = (test, common) => {
  test('should_execute returning false should not call service', t => {
    t.plan(3, 'should_execute will assert 2 things + 1 for next() was called');

    const service = () => {
      t.fail('service should not have been called');
    };

    const should_execute = (req, res) => {
      t.deepEquals(req, { a: 1 });
      t.deepEquals(res, { b: 2 });
      return false;
    };

    const controller = setup(service, should_execute);

    controller({ a: 1 }, { b: 2 }, () => {
      t.pass('next was called');
    });

  });

};

module.exports.tests.error_conditions = (test, common) => {
  test('service error string should log and not modify any results', t => {
    t.plan(2);

    const service = (req, res, callback) => {
      callback('this is an error', {
        properties: {
          number: 17,
          source: 'OSM',
          source_id: 'openstreetmap source id',
          lat: 12.121212,
          lon: 21.212121
        }
      });

    };

    const logger = require('pelias-mock-logger')();

    const controller = proxyquire('../../../middleware/interpolate', {
      'pelias-logger': logger
    })(service, () => true);

    const req = { a: 1 };
    const res = {
      data: [
        {
          id: 1,
          layer: 'street',
          name: {
            default: 'street name 1'
          },
          address_parts: {},
          // bounding_box should be removed
          bounding_box: {}
        }
      ]
    };

    controller(req, res, () => {
      t.ok(logger.isErrorMessage('[middleware:interpolation] this is an error'));

      t.deepEquals(res, {
        data: [
          {
            id: 1,
            layer: 'street',
            name: {
              default: 'street name 1'
            },
            address_parts: {},
            // bounding_box should be removed
            bounding_box: {}
          }
        ]
      }, 'res should not have been modified');

    });

  });

  test('service error object should log message and not modify any results', t => {
    t.plan(2);

    const service = (req, res, callback) => {
      callback({ message: 'this is an error' }, {
        properties: {
          number: 17,
          source: 'OSM',
          source_id: 'openstreetmap source id',
          lat: 12.121212,
          lon: 21.212121
        }
      });

    };

    const logger = require('pelias-mock-logger')();

    const controller = proxyquire('../../../middleware/interpolate', {
      'pelias-logger': logger
    })(service, () => true);

    const req = { a: 1 };
    const res = {
      data: [
        {
          id: 1,
          layer: 'street',
          name: {
            default: 'street name 1'
          },
          address_parts: {},
          // bounding_box should be removed
          bounding_box: {}
        }
      ]
    };

    controller(req, res, () => {
      t.ok(logger.isErrorMessage('[middleware:interpolation] this is an error'));

      t.deepEquals(res, {
        data: [
          {
            id: 1,
            layer: 'street',
            name: {
              default: 'street name 1'
            },
            address_parts: {},
            // bounding_box should be removed
            bounding_box: {}
          }
        ]
      }, 'res should not have been modified');

    });

  });

};

module.exports.tests.success_conditions = (test, common) => {
  test('undefined res should not cause errors', t => {
    const service = (req, res, callback) => {
      t.fail('should not have been called');
    };

    const logger = require('pelias-mock-logger')();

    const controller = proxyquire('../../../middleware/interpolate', {
      'pelias-logger': logger
    })(service, () => true);

    const req = {
      clean: {
        parsed_text: 'this is req.clean.parsed_text'
      }
    };

    controller(req, undefined, () => {
      t.notOk(logger.hasErrorMessages(), 'there shouldn\'t be any error messages');
      t.ok(logger.isInfoMessage(/\[interpolation\] \[took\] \d+ ms/));
      t.end();

    });

  });

  test('undefined res.data should not cause errors', t => {
    const service = (req, res, callback) => {
      t.fail('should not have been called');
    };

    const logger = require('pelias-mock-logger')();

    const controller = proxyquire('../../../middleware/interpolate', {
      'pelias-logger': logger
    })(service, () => true);

    const req = {
      clean: {
        parsed_text: 'this is req.clean.parsed_text'
      }
    };

    const res = {};

    controller(req, res, () => {
      t.notOk(logger.hasErrorMessages(), 'there shouldn\'t be any error messages');
      t.ok(logger.isInfoMessage(/\[interpolation\] \[took\] \d+ ms/));

      t.deepEquals(res, {});

      t.end();

    });

  });

  test('interpolated results should be mapped in', t => {
    const service = (req, res, callback) => {
      if (res.id === 1) {
        callback(null, {
          properties: {
            number: 17,
            source: 'Source Abbr 1',
            source_id: 'source 1 source id',
            lat: 12.121212,
            lon: 21.212121
          }
        });

      } else if (res.id === 3) {
        callback(null, {
          properties: {
            number: 18,
            source: 'Source Abbr 2',
            source_id: 'source 2 source id',
            lat: 13.131313,
            lon: 31.313131
          }
        });

      } else if (res.id === 4) {
        callback(null, {
          properties: {
            number: 19,
            source: 'non-OSM/OA',
            source_id: 'mixed source id',
            lat: 14.141414,
            lon: 41.414141
          }
        });

      } else {
        t.fail(`unexpected id ${res.id}`);

      }

    };

    const logger = require('pelias-mock-logger')();

    const controller = proxyquire('../../../middleware/interpolate', {
      'pelias-logger': logger,
      '../helper/type_mapping': {
        source_mapping: {
          'source abbr 1': ['full source name 1'],
          'source abbr 2': ['full source name 2']
        }
      }
    })(service, () => true);

    const req = {
      clean: {
        parsed_text: 'this is req.clean.parsed_text'
      }
    };

    const res = {
      data: [
        {
          id: 1,
          layer: 'street',
          name: {
            default: 'street name 1'
          },
          address_parts: {},
          // will be replaced
          source_id: 'original source_id',
          // bounding_box should be removed
          bounding_box: {}
        },
        {
          id: 2,
          layer: 'not street',
          name: {
            default: 'name 2'
          },
          address_parts: {}
        },
        {
          id: 3,
          layer: 'street',
          name: {
            default: 'street name 3'
          },
          address_parts: {}
        },
        {
          id: 4,
          layer: 'street',
          name: {
            default: 'street name 4'
          },
          address_parts: {}
        }
      ]
    };

    controller(req, res, () => {
      t.notOk(logger.hasErrorMessages(), 'there shouldn\'t be any error messages');
      t.ok(logger.isInfoMessage(/\[interpolation\] \[took\] \d+ ms/), 'timing should be info-logged');

      // test debug messages very vaguely to avoid brittle tests
      t.ok(logger.isDebugMessage(/^\[interpolation\] \[hit\] this is req.clean.parsed_text \{.+?\}$/),
        'hits should be debug-logged');

      t.deepEquals(res, {
        data: [
          {
            id: 1,
            layer: 'address',
            match_type: 'interpolated',
            name: {
              default: '17 street name 1'
            },
            source: 'full source name 1',
            source_id: 'source 1 source id',
            address_parts: {
              number: 17
            },
            center_point: {
              lat: 12.121212,
              lon: 21.212121
            }
          },
          {
            id: 3,
            layer: 'address',
            match_type: 'interpolated',
            name: {
              default: '18 street name 3'
            },
            source: 'full source name 2',
            source_id: 'source 2 source id',
            address_parts: {
              number: 18
            },
            center_point: {
              lat: 13.131313,
              lon: 31.313131
            }
          },
          {
            id: 4,
            layer: 'address',
            match_type: 'interpolated',
            name: {
              default: '19 street name 4'
            },
            source: 'mixed',
            source_id: 'mixed source id',
            address_parts: {
              number: 19
            },
            center_point: {
              lat: 14.141414,
              lon: 41.414141
            }
          },
          {
            id: 2,
            layer: 'not street',
            name: {
              default: 'name 2'
            },
            address_parts: {}
          }
        ]
      }, 'hits should be mapped in and res.data sorted with addresses first and non-addresses last');

      t.end();

    });

  });

  test('interpolation result without source_id should remove all together', t => {
    const service = (req, res, callback) => {
      if (res.id === 1) {
        callback(null, {
          properties: {
            number: 17,
            source: 'OA',
            lat: 12.121212,
            lon: 21.212121
          }
        });

      } else {
        t.fail(`should not have been called with id ${res.id}`);

      }

    };

    const logger = require('pelias-mock-logger')();

    const controller = proxyquire('../../../middleware/interpolate', {
      'pelias-logger': logger
    })(service, () => true);

    const req = {
      clean: {
        parsed_text: 'this is req.clean.parsed_text'
      }
    };

    const res = {
      data: [
        // doc with 2 layer names that will be changed
        {
          id: 1,
          layer: 'street',
          name: {
            default: 'street name 1'
          },
          // will be removed
          source_id: 'original source_id',
          address_parts: {}
        }
      ]
    };

    controller(req, res, () => {
      t.notOk(logger.hasErrorMessages(), 'there shouldn\'t be any error messages');
      t.ok(logger.isInfoMessage(/\[interpolation\] \[took\] \d+ ms/));

      t.deepEquals(res, {
        data: [
          {
            id: 1,
            layer: 'address',
            match_type: 'interpolated',
            name: {
              default: '17 street name 1'
            },
            source: 'openaddresses',
            address_parts: {
              number: 17
            },
            center_point: {
              lat: 12.121212,
              lon: 21.212121
            }
          }
        ]
      }, 'interpolation result did not have source_id so removed from source result');

      t.end();

    });

  });

  test('undefined results should be skipped and not be fatal', t => {
    const service = (req, res, callback) => {
      if (res.id === 1) {
        callback(null, undefined);

      } else if (res.id === 2) {
        callback(null, {
          properties: {
            number: 18,
            source: 'OA',
            source_id: 'openaddresses source id',
            lat: 13.131313,
            lon: 31.313131
          }
        });

      } else {
        t.fail(`should not have been called with id ${res.id}`);

      }

    };

    const logger = require('pelias-mock-logger')();

    const controller = proxyquire('../../../middleware/interpolate', {
      'pelias-logger': logger
    })(service, () => true);

    const req = {
      clean: {
        parsed_text: 'this is req.clean.parsed_text'
      }
    };

    const res = {
      data: [
        // doc with 2 layer names that will be changed
        {
          id: 1,
          layer: 'street',
          name: {
            default: 'street name 1'
          },
          address_parts: {}
        },
        {
          id: 2,
          layer: 'street',
          name: {
            default: 'street name 2'
          },
          address_parts: {}
        }
      ]
    };

    controller(req, res, () => {
      t.notOk(logger.hasErrorMessages(), 'there shouldn\'t be any error messages');
      t.ok(logger.isInfoMessage(/\[interpolation\] \[took\] \d+ ms/));

      // test debug messages very vaguely to avoid brittle tests
      t.ok(logger.isDebugMessage('[interpolation] [miss] this is req.clean.parsed_text'));

      t.deepEquals(res, {
        data: [
          {
            id: 2,
            layer: 'address',
            match_type: 'interpolated',
            name: {
              default: '18 street name 2'
            },
            source: 'openaddresses',
            source_id: 'openaddresses source id',
            address_parts: {
              number: 18
            },
            center_point: {
              lat: 13.131313,
              lon: 31.313131
            }
          },
          {
            id: 1,
            layer: 'street',
            name: {
              default: 'street name 1'
            },
            address_parts: {}
          }
        ]
      }, 'only hits should have been mapped in');

      t.end();

    });

  });

  test('results missing \'properties\' should be skipped and not be fatal', t => {
    const service = (req, res, callback) => {
      if (res.id === 1) {
        callback(null, {});

      } else if (res.id === 2) {
        callback(null, {
          properties: {
            number: 18,
            source: 'OA',
            source_id: 'openaddresses source id',
            lat: 13.131313,
            lon: 31.313131
          }
        });

      } else {
        t.fail(`should not have been called with id ${res.id}`);

      }

    };

    const logger = require('pelias-mock-logger')();

    const controller = proxyquire('../../../middleware/interpolate', {
      'pelias-logger': logger
    })(service, () => true);

    const req = {
      clean: {
        parsed_text: 'this is req.clean.parsed_text'
      }
    };

    const res = {
      data: [
        // doc with 2 layer names that will be changed
        {
          id: 1,
          layer: 'street',
          name: {
            default: 'street name 1'
          },
          address_parts: {}
        },
        {
          id: 2,
          layer: 'street',
          name: {
            default: 'street name 2'
          },
          address_parts: {}
        }
      ]
    };

    controller(req, res, () => {
      t.notOk(logger.hasErrorMessages(), 'there shouldn\'t be any error messages');
      t.ok(logger.isInfoMessage(/\[interpolation\] \[took\] \d+ ms/));

      // test debug messages very vaguely to avoid brittle tests
      t.ok(logger.isDebugMessage('[interpolation] [miss] this is req.clean.parsed_text'));

      t.deepEquals(res, {
        data: [
          {
            id: 2,
            layer: 'address',
            match_type: 'interpolated',
            name: {
              default: '18 street name 2'
            },
            source: 'openaddresses',
            source_id: 'openaddresses source id',
            address_parts: {
              number: 18
            },
            center_point: {
              lat: 13.131313,
              lon: 31.313131
            }
          },
          {
            id: 1,
            layer: 'street',
            name: {
              default: 'street name 1'
            },
            address_parts: {}
          }
        ]
      });

      t.end();

    }, 'only hits should have been mapped in');

  });

};

module.exports.all = function (tape, common) {

  function test(name, testFunction) {
    return tape(`[middleware] interpolate: ${name}`, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
