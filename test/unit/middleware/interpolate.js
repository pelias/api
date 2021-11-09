const setup = require('../../../middleware/interpolate');
const proxyquire = require('proxyquire').noCallThru();
const _ = require('lodash');

module.exports.tests = {};

module.exports.tests.interface = (test, common) => {
  test('valid interface', (t) => {
    t.equal(typeof setup, 'function', 'setup is a function');
    t.equal(typeof setup(), 'function', 'setup returns a controller');
    t.end();
  });
};

module.exports.tests.early_exit_conditions = (test, common) => {
  test('should_execute returning false should not call service', (t) => {
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

module.exports.tests.success_conditions = (test, common) => {
  test('undefined res should not cause errors', (t) => {
    const service = (req, res, callback) => {
      t.fail('should not have been called');
    };

    const logger = require('pelias-mock-logger')();

    const controller = proxyquire('../../../middleware/interpolate', {
      'pelias-logger': logger,
    })(service, () => true);

    const req = {
      clean: {
        parsed_text: 'this is req.clean.parsed_text',
      },
    };

    controller(req, undefined, () => {
      t.notOk(
        logger.hasErrorMessages(),
        "there shouldn't be any error messages",
      );
      t.end();
    });
  });

  test('undefined res.data should not cause errors', (t) => {
    const service = (req, res, callback) => {
      t.fail('should not have been called');
    };

    const logger = require('pelias-mock-logger')();

    const controller = proxyquire('../../../middleware/interpolate', {
      'pelias-logger': logger,
    })(service, () => true);

    const req = {
      clean: {
        parsed_text: 'this is req.clean.parsed_text',
      },
    };

    const res = {};

    controller(req, res, () => {
      t.notOk(
        logger.hasErrorMessages(),
        "there shouldn't be any error messages",
      );

      t.deepEquals(res, {});

      t.end();
    });
  });

  test("only 'street' layer results should attempt interpolation", (t) => {
    const service = (req, res, callback) => {
      if (res.id === 1) {
        callback(null, {
          properties: {
            number: 17,
            source: 'Source Abbr 1',
            source_id: 'source 1 source id',
            lat: 12.121212,
            lon: 21.212121,
          },
        });
      } else if (res.id === 3) {
        callback(null, {
          properties: {
            number: 18,
            source: 'Source Abbr 2',
            source_id: 'source 2 source id',
            lat: 13.131313,
            lon: 31.313131,
          },
        });
      } else if (res.id === 4) {
        callback(null, {
          properties: {
            number: 19,
            source: 'non-OSM/OA',
            source_id: 'mixed source id',
            lat: 14.141414,
            lon: 41.414141,
          },
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
          'source abbr 2': ['full source name 2'],
        },
      },
    })(service, () => true);

    const req = {
      clean: {
        parsed_text: 'this is req.clean.parsed_text',
      },
    };

    const res = {
      data: [
        {
          id: 1,
          layer: 'street',
          name: {
            default: 'street name 1',
          },
          address_parts: {},
          // will be replaced
          source_id: 'original source_id',
          // bounding_box should be removed
          bounding_box: {},
        },
        {
          // this is not a street result and should not attempt interpolation
          id: 2,
          layer: 'not street',
          name: {
            default: 'name 2',
          },
          address_parts: {},
        },
        {
          id: 3,
          layer: 'street',
          name: {
            default: 'street name 3',
          },
          address_parts: {},
        },
        {
          id: 4,
          layer: 'street',
          name: {
            default: 'street name 4',
          },
          address_parts: {},
        },
      ],
    };

    controller(req, res, () => {
      t.notOk(
        logger.hasErrorMessages(),
        "there shouldn't be any error messages",
      );

      t.deepEquals(
        res,
        {
          data: [
            {
              id: 1,
              layer: 'address',
              match_type: 'interpolated',
              name: {
                default: '17 street name 1',
              },
              source: 'full source name 1',
              source_id: 'source 1 source id',
              address_parts: {
                number: 17,
              },
              center_point: {
                lat: 12.121212,
                lon: 21.212121,
              },
            },
            {
              id: 3,
              layer: 'address',
              match_type: 'interpolated',
              name: {
                default: '18 street name 3',
              },
              source: 'full source name 2',
              source_id: 'source 2 source id',
              address_parts: {
                number: 18,
              },
              center_point: {
                lat: 13.131313,
                lon: 31.313131,
              },
            },
            {
              id: 4,
              layer: 'address',
              match_type: 'interpolated',
              name: {
                default: '19 street name 4',
              },
              source: 'mixed',
              source_id: 'mixed source id',
              address_parts: {
                number: 19,
              },
              center_point: {
                lat: 14.141414,
                lon: 41.414141,
              },
            },
            {
              id: 2,
              layer: 'not street',
              name: {
                default: 'name 2',
              },
              address_parts: {},
            },
          ],
        },
        'hits should be mapped in and res.data sorted with addresses first and non-addresses last',
      );

      t.end();
    });
  });

  test('results should be sorted first by address/non-address. previous ordering should otherwise be maintained via a stable sort', (t) => {
    const service = (req, res, callback) => {
      // results 5 and 7 will have interpolated results returned
      // this is to ensure results are re-sorted to move the addresses first
      if (res.id === 5 || res.id === 7) {
        callback(null, {
          properties: {
            number: 17,
            source: 'Source Abbr 1',
            source_id: 'source 1 source id',
            lat: 12.121212,
            lon: 21.212121,
          },
        });
      } else {
        // return empty results in most cases
        callback(null, {});
      }
    };

    const logger = require('pelias-mock-logger')();

    const controller = proxyquire('../../../middleware/interpolate', {
      'pelias-logger': logger,
    })(service, () => true);

    const req = {
      clean: {
        parsed_text: 'this is req.clean.parsed_text',
      },
    };
    const res = {};

    // helper method to generate test results which default to streets
    function generateTestStreets(id) {
      return {
        id: id + 1,
        layer: 'street',
        name: { default: `name ${id + 1}` },
        address_parts: {},
        source_id: 'original source_id',
      };
    }

    // generate a set of street results of desired size
    // NOTE: this set must be of 11 elements or greater
    // Node.js uses stable insertion sort for arrays of 10 or fewer elements,
    // but _unstable_ QuickSort for larger arrays
    const resultCount = 11;
    const sequence_array = Array.from(
      new Array(resultCount),
      (val, index) => index,
    );
    res.data = sequence_array.map(generateTestStreets);

    controller(req, res, () => {
      t.notOk(
        logger.hasErrorMessages(),
        "there shouldn't be any error messages",
      );

      const results = res.data;

      t.equals(
        results.length,
        results.length,
        'correct number of results should be returned',
      );
      t.equals(
        results[0].layer,
        'address',
        'first result should be interpolated address',
      );
      t.equals(
        results[1].layer,
        'address',
        'second result should be interpolated address',
      );

      // iterate through all remaining records, ensuring their ids are increasing,
      // as was the case when the set of streets was originally generated
      let previous_id;
      for (let i = 2; i < results.length; i++) {
        if (previous_id) {
          t.ok(
            results[i].id > previous_id,
            `id ${results[i].id} should be higher than ${previous_id}, to ensure sort is stable`,
          );
        }
        previous_id = results[i].id;
      }

      t.end();
    });
  });

  test('service call returning error should not map in interpolated results for non-errors', (t) => {
    const service = (req, res, callback) => {
      if (res.id === 1) {
        callback(null, {
          properties: {
            number: 17,
            source: 'Source Abbr 1',
            source_id: 'source 1 source id',
            lat: 12.121212,
            lon: 21.212121,
          },
        });
      } else if (res.id === 2) {
        callback('id 2 produced an error string', {});
      } else if (res.id === 3) {
        callback({ message: 'id 3 produced an error object' }, {});
      } else if (res.id === 4) {
        callback(null, {
          properties: {
            number: 18,
            source: 'Source Abbr 4',
            source_id: 'source 4 source id',
            lat: 13.131313,
            lon: 31.313131,
          },
        });
      } else {
        console.error(res.id);
        t.fail(`unexpected id ${res.id}`);
      }
    };

    const logger = require('pelias-mock-logger')();

    const controller = proxyquire('../../../middleware/interpolate', {
      'pelias-logger': logger,
      '../helper/type_mapping': {
        source_mapping: {
          'source abbr 1': ['full source name 1'],
          'source abbr 4': ['full source name 4'],
        },
      },
    })(service, () => true);

    const req = {
      clean: {
        parsed_text: 'this is req.clean.parsed_text',
      },
    };

    const res = {
      data: [
        {
          id: 1,
          layer: 'street',
          name: {
            default: 'street name 1',
          },
          address_parts: {},
        },
        {
          id: 2,
          layer: 'street',
          name: {
            default: 'street name 2',
          },
          address_parts: {},
        },
        {
          id: 3,
          layer: 'street',
          name: {
            default: 'street name 3',
          },
          address_parts: {},
        },
        {
          id: 4,
          layer: 'street',
          name: {
            default: 'street name 4',
          },
          address_parts: {},
        },
      ],
    };

    controller(req, res, () => {
      t.deepEquals(logger.getErrorMessages(), [
        '[middleware:interpolation] id 2 produced an error string',
        '[middleware:interpolation] id 3 produced an error object',
      ]);

      t.deepEquals(
        res,
        {
          data: [
            {
              id: 1,
              layer: 'address',
              match_type: 'interpolated',
              name: {
                default: '17 street name 1',
              },
              source: 'full source name 1',
              source_id: 'source 1 source id',
              address_parts: {
                number: 17,
              },
              center_point: {
                lat: 12.121212,
                lon: 21.212121,
              },
            },
            {
              id: 4,
              layer: 'address',
              match_type: 'interpolated',
              name: {
                default: '18 street name 4',
              },
              source: 'full source name 4',
              source_id: 'source 4 source id',
              address_parts: {
                number: 18,
              },
              center_point: {
                lat: 13.131313,
                lon: 31.313131,
              },
            },
            {
              id: 2,
              layer: 'street',
              name: {
                default: 'street name 2',
              },
              address_parts: {},
            },
            {
              id: 3,
              layer: 'street',
              name: {
                default: 'street name 3',
              },
              address_parts: {},
            },
          ],
        },
        'hits should be mapped in and res.data sorted with addresses first and non-addresses last',
      );

      t.end();
    });
  });

  test('interpolation result without source_id should default to street ID', (t) => {
    const service = (req, res, callback) => {
      if (res.id === 1) {
        callback(null, {
          properties: {
            number: 17,
            source: 'OA',
            lat: 12.121212,
            lon: 21.212121,
          },
        });
      } else {
        t.fail(`should not have been called with id ${res.id}`);
      }
    };

    const logger = require('pelias-mock-logger')();

    const controller = proxyquire('../../../middleware/interpolate', {
      'pelias-logger': logger,
    })(service, () => true);

    const req = {
      clean: {
        parsed_text: 'this is req.clean.parsed_text',
      },
    };

    const res = {
      data: [
        // doc with 2 layer names that will be changed
        {
          id: 1,
          layer: 'street',
          name: {
            default: 'street name 1',
          },
          // will be used in the case where interpolated result has no source_id
          source_id: 'original source_id',
          address_parts: {},
        },
      ],
    };

    controller(req, res, () => {
      t.notOk(
        logger.hasErrorMessages(),
        "there shouldn't be any error messages",
      );

      t.deepEquals(
        res,
        {
          data: [
            {
              id: 1,
              layer: 'address',
              match_type: 'interpolated',
              name: {
                default: '17 street name 1',
              },
              source: 'openaddresses',
              source_id: 'original source_id',
              address_parts: {
                number: 17,
              },
              center_point: {
                lat: 12.121212,
                lon: 21.212121,
              },
            },
          ],
        },
        'interpolation result did not have source_id so removed from source result',
      );

      t.end();
    });
  });

  test('undefined results should be skipped and not be fatal', (t) => {
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
            lon: 31.313131,
          },
        });
      } else {
        t.fail(`should not have been called with id ${res.id}`);
      }
    };

    const logger = require('pelias-mock-logger')();

    const controller = proxyquire('../../../middleware/interpolate', {
      'pelias-logger': logger,
    })(service, () => true);

    const req = {
      clean: {
        parsed_text: 'this is req.clean.parsed_text',
      },
    };

    const res = {
      data: [
        // doc with 2 layer names that will be changed
        {
          id: 1,
          layer: 'street',
          name: {
            default: 'street name 1',
          },
          address_parts: {},
        },
        {
          id: 2,
          layer: 'street',
          name: {
            default: 'street name 2',
          },
          address_parts: {},
        },
      ],
    };

    controller(req, res, () => {
      t.notOk(
        logger.hasErrorMessages(),
        "there shouldn't be any error messages",
      );

      t.deepEquals(
        res,
        {
          data: [
            {
              id: 2,
              layer: 'address',
              match_type: 'interpolated',
              name: {
                default: '18 street name 2',
              },
              source: 'openaddresses',
              source_id: 'openaddresses source id',
              address_parts: {
                number: 18,
              },
              center_point: {
                lat: 13.131313,
                lon: 31.313131,
              },
            },
            {
              id: 1,
              layer: 'street',
              name: {
                default: 'street name 1',
              },
              address_parts: {},
            },
          ],
        },
        'only hits should have been mapped in',
      );

      t.end();
    });
  });

  test("results missing 'properties' should be skipped and not be fatal", (t) => {
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
            lon: 31.313131,
          },
        });
      } else {
        t.fail(`should not have been called with id ${res.id}`);
      }
    };

    const logger = require('pelias-mock-logger')();

    const controller = proxyquire('../../../middleware/interpolate', {
      'pelias-logger': logger,
    })(service, () => true);

    const req = {
      clean: {
        parsed_text: 'this is req.clean.parsed_text',
      },
    };

    const res = {
      data: [
        // doc with 2 layer names that will be changed
        {
          id: 1,
          layer: 'street',
          name: {
            default: 'street name 1',
          },
          address_parts: {},
        },
        {
          id: 2,
          layer: 'street',
          name: {
            default: 'street name 2',
          },
          address_parts: {},
        },
      ],
    };

    controller(
      req,
      res,
      () => {
        t.notOk(
          logger.hasErrorMessages(),
          "there shouldn't be any error messages",
        );

        t.deepEquals(res, {
          data: [
            {
              id: 2,
              layer: 'address',
              match_type: 'interpolated',
              name: {
                default: '18 street name 2',
              },
              source: 'openaddresses',
              source_id: 'openaddresses source id',
              address_parts: {
                number: 18,
              },
              center_point: {
                lat: 13.131313,
                lon: 31.313131,
              },
            },
            {
              id: 1,
              layer: 'street',
              name: {
                default: 'street name 1',
              },
              address_parts: {},
            },
          ],
        });

        t.end();
      },
      'only hits should have been mapped in',
    );
  });
};

module.exports.all = function (tape, common) {
  function test(name, testFunction) {
    return tape(`[middleware] interpolate: ${name}`, testFunction);
  }

  for (var testCase in module.exports.tests) {
    module.exports.tests[testCase](test, common);
  }
};
