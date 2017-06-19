'use strict';

const setup = require('../../../controller/coarse_reverse');
const proxyquire =  require('proxyquire').noCallThru();
const _  = require('lodash');

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
    t.plan(2);

    const service = () => {
      throw Error('service should not have been called');
    };

    const controller = setup(service, _.constant(false));

    const req = {
      clean: {
        layers: ['locality']
      },
      errors: ['error']
    };

    // verify that next was called
    const next = () => {
      t.pass('next() was called');
    };

    // passing res=undefined verifies that it wasn't interacted with
    t.doesNotThrow(controller.bind(null, req, undefined, next));
    t.end();

  });

};

module.exports.tests.error_conditions = (test, common) => {
  test('service error should log and call next', (t) => {
    t.plan(3);

    const service = (req, callback) => {
      t.deepEquals(req, { clean: { layers: ['locality'] } } );
      callback('this is an error');
    };

    const logger = require('pelias-mock-logger')();

    const controller = proxyquire('../../../controller/coarse_reverse', {
      'pelias-logger': logger
    })(service, _.constant(true));

    const req = {
      clean: {
        layers: ['locality']
      }
    };

    // verify that next was called
    const next = () => {
      t.pass('next() was called');
    };

    // passing res=undefined verifies that it wasn't interacted with
    controller(req, undefined, next);

    t.ok(logger.isErrorMessage('this is an error'));
    t.end();

  });

};

module.exports.tests.boundary_circle_radius_warnings = (test, common) => {
  test('defined clean[boundary.circle.radius] should add a warning', (t) => {
    const service = (req, callback) => {
      callback(undefined, {});
    };

    const logger = require('pelias-mock-logger')();

    const controller = proxyquire('../../../controller/coarse_reverse', {
      'pelias-logger': logger
    })(service, _.constant(true));

    const req = {
      warnings: [],
      clean: {
        'boundary.circle.radius': 17
      }
    };

    const res = { };

    const next = () => {};

    controller(req, res, next);

    const expected = {
      meta: {},
      data: []
    };

    t.deepEquals(req.warnings, ['boundary.circle.radius is not applicable for coarse reverse']);
    t.deepEquals(res, expected);
    t.notOk(logger.hasErrorMessages());
    t.end();

  });

  test('defined clean[boundary.circle.radius] should add a warning', (t) => {
    const service = (req, callback) => {
      callback(undefined, {});
    };

    const logger = require('pelias-mock-logger')();

    const controller = proxyquire('../../../controller/coarse_reverse', {
      'pelias-logger': logger
    })(service, _.constant(true));

    const req = {
      warnings: [],
      clean: {}
    };

    const res = { };

    // verify that next was called
    const next = () => { };

    controller(req, res, next);

    const expected = {
      meta: {},
      data: []
    };

    t.deepEquals(req.warnings, []);
    t.deepEquals(res, expected);
    t.notOk(logger.hasErrorMessages());
    t.end();

  });

};

module.exports.tests.success_conditions = (test, common) => {
  test('service returning results should use first entry for each layer', (t) => {
    t.plan(4);

    const service = (req, callback) => {
      t.deepEquals(req, { clean: { layers: ['neighbourhood'] } } );

      const results = {
        neighbourhood: [
          {
            id: 10,
            name: 'neighbourhood name',
            abbr: 'neighbourhood abbr',
            centroid: {
              lat: 12.121212,
              lon: 21.212121
            },
            bounding_box: '-76.345902,40.006751,-76.254038,40.072939'
          },
          { id: 11, name: 'neighbourhood name 2'}
        ],
        borough: [
          { id: 20, name: 'borough name', abbr: 'borough abbr'},
          { id: 21, name: 'borough name 2'}
        ],
        locality: [
          { id: 30, name: 'locality name', abbr: 'locality abbr'},
          { id: 31, name: 'locality name 2'}
        ],
        localadmin: [
          { id: 40, name: 'localadmin name', abbr: 'localadmin abbr'},
          { id: 41, name: 'localadmin name 2'}
        ],
        county: [
          { id: 50, name: 'county name', abbr: 'county abbr'},
          { id: 51, name: 'county name 2'}
        ],
        macrocounty: [
          { id: 60, name: 'macrocounty name', abbr: 'macrocounty abbr'},
          { id: 61, name: 'macrocounty name 2'}
        ],
        region: [
          { id: 70, name: 'region name', abbr: 'region abbr'},
          { id: 71, name: 'region name 2'}
        ],
        macroregion: [
          { id: 80, name: 'macroregion name', abbr: 'macroregion abbr'},
          { id: 81, name: 'macroregion name 2'}
        ],
        dependency: [
          { id: 90, name: 'dependency name', abbr: 'dependency abbr'},
          { id: 91, name: 'dependency name 2'}
        ],
        country: [
          { id: 100, name: 'country name', abbr: 'xyz'},
          { id: 101, name: 'country name 2'}
        ]
      };

      callback(undefined, results);
    };

    const logger = require('pelias-mock-logger')();

    const controller = proxyquire('../../../controller/coarse_reverse', {
      'pelias-logger': logger
    })(service, _.constant(true));

    const req = {
      clean: {
        layers: ['neighbourhood']
      }
    };

    const res = { };

    // verify that next was called
    const next = () => {
      t.pass('next() was called');
    };

    controller(req, res, next);

    const expected = {
      meta: {},
      data: [
        {
          _id: '10',
          _type: 'neighbourhood',
          layer: 'neighbourhood',
          source: 'whosonfirst',
          source_id: '10',
          name: {
            'default': 'neighbourhood name'
          },
          phrase: {
            'default': 'neighbourhood name'
          },
          parent: {
            neighbourhood: ['neighbourhood name'],
            neighbourhood_id: ['10'],
            neighbourhood_a: ['neighbourhood abbr'],
            borough: ['borough name'],
            borough_id: ['20'],
            borough_a: ['borough abbr'],
            locality: ['locality name'],
            locality_id: ['30'],
            locality_a: ['locality abbr'],
            localadmin: ['localadmin name'],
            localadmin_id: ['40'],
            localadmin_a: ['localadmin abbr'],
            county: ['county name'],
            county_id: ['50'],
            county_a: ['county abbr'],
            macrocounty: ['macrocounty name'],
            macrocounty_id: ['60'],
            macrocounty_a: ['macrocounty abbr'],
            region: ['region name'],
            region_id: ['70'],
            region_a: ['region abbr'],
            macroregion: ['macroregion name'],
            macroregion_id: ['80'],
            macroregion_a: ['macroregion abbr'],
            dependency: ['dependency name'],
            dependency_id: ['90'],
            dependency_a: ['dependency abbr'],
            country: ['country name'],
            country_id: ['100'],
            country_a: ['xyz']
          },
          center_point: {
            lat: 12.121212,
            lon: 21.212121
          },
          bounding_box: '{"min_lat":40.006751,"max_lat":40.072939,"min_lon":-76.345902,"max_lon":-76.254038}'
        }
      ]
    };

    t.deepEquals(res, expected);
    t.notOk(logger.hasErrorMessages());
    t.end();

  });

  test('layers missing from results should be ignored', (t) => {
    t.plan(4);

    const service = (req, callback) => {
      t.deepEquals(req, { clean: { layers: ['neighbourhood'] } } );

      const results = {
        neighbourhood: [
          {
            id: 10,
            name: 'neighbourhood name',
            centroid: {
              lat: 12.121212,
              lon: 21.212121
            },
            bounding_box: '-76.345902,40.006751,-76.254038,40.072939'
          }
        ]
      };

      callback(undefined, results);
    };

    const logger = require('pelias-mock-logger')();

    const controller = proxyquire('../../../controller/coarse_reverse', {
      'pelias-logger': logger
    })(service, _.constant(true));

    const req = {
      clean: {
        layers: ['neighbourhood']
      }
    };

    const res = { };

    // verify that next was called
    const next = () => {
      t.pass('next() was called');
    };

    controller(req, res, next);

    const expected = {
      meta: {},
      data: [
        {
          _id: '10',
          _type: 'neighbourhood',
          layer: 'neighbourhood',
          source: 'whosonfirst',
          source_id: '10',
          name: {
            'default': 'neighbourhood name'
          },
          phrase: {
            'default': 'neighbourhood name'
          },
          parent: {
            neighbourhood: ['neighbourhood name'],
            neighbourhood_id: ['10'],
            neighbourhood_a: [null]
          },
          center_point: {
            lat: 12.121212,
            lon: 21.212121
          },
          bounding_box: '{"min_lat":40.006751,"max_lat":40.072939,"min_lon":-76.345902,"max_lon":-76.254038}'
        }
      ]
    };

    t.deepEquals(res, expected);
    t.notOk(logger.hasErrorMessages());
    t.end();

  });

  test('most granular layer missing centroid should not set', (t) => {
    t.plan(4);

    const service = (req, callback) => {
      t.deepEquals(req, { clean: { layers: ['neighbourhood'] } } );

      const results = {
        neighbourhood: [
          {
            id: 10,
            name: 'neighbourhood name',
            abbr: 'neighbourhood abbr',
            bounding_box: '-76.345902,40.006751,-76.254038,40.072939'
          }
        ]
      };

      callback(undefined, results);
    };

    const logger = require('pelias-mock-logger')();

    const controller = proxyquire('../../../controller/coarse_reverse', {
      'pelias-logger': logger
    })(service, _.constant(true));

    const req = {
      clean: {
        layers: ['neighbourhood']
      }
    };

    const res = { };

    // verify that next was called
    const next = () => {
      t.pass('next() was called');
    };

    controller(req, res, next);

    const expected = {
      meta: {},
      data: [
        {
          _id: '10',
          _type: 'neighbourhood',
          layer: 'neighbourhood',
          source: 'whosonfirst',
          source_id: '10',
          name: {
            'default': 'neighbourhood name'
          },
          phrase: {
            'default': 'neighbourhood name'
          },
          parent: {
            neighbourhood: ['neighbourhood name'],
            neighbourhood_id: ['10'],
            neighbourhood_a: ['neighbourhood abbr']
          },
          bounding_box: '{"min_lat":40.006751,"max_lat":40.072939,"min_lon":-76.345902,"max_lon":-76.254038}'
        }
      ]
    };

    t.deepEquals(res, expected);
    t.notOk(logger.hasErrorMessages());
    t.end();

  });

  test('most granular layer missing bounding_box should not set', (t) => {
    t.plan(4);

    const service = (req, callback) => {
      t.deepEquals(req, { clean: { layers: ['neighbourhood'] } } );

      const results = {
        neighbourhood: [
          {
            id: 10,
            name: 'neighbourhood name',
            abbr: 'neighbourhood abbr',
            centroid: {
              lat: 12.121212,
              lon: 21.212121
            }
          }
        ]
      };

      callback(undefined, results);
    };

    const logger = require('pelias-mock-logger')();

    const controller = proxyquire('../../../controller/coarse_reverse', {
      'pelias-logger': logger
    })(service, _.constant(true));

    const req = {
      clean: {
        layers: ['neighbourhood']
      }
    };

    const res = { };

    // verify that next was called
    const next = () => {
      t.pass('next() was called');
    };

    controller(req, res, next);

    const expected = {
      meta: {},
      data: [
        {
          _id: '10',
          _type: 'neighbourhood',
          layer: 'neighbourhood',
          source: 'whosonfirst',
          source_id: '10',
          name: {
            'default': 'neighbourhood name'
          },
          phrase: {
            'default': 'neighbourhood name'
          },
          parent: {
            neighbourhood: ['neighbourhood name'],
            neighbourhood_id: ['10'],
            neighbourhood_a: ['neighbourhood abbr']
          },
          center_point: {
            lat: 12.121212,
            lon: 21.212121
          }
        }
      ]
    };

    t.deepEquals(res, expected);

    t.notOk(logger.hasErrorMessages());
    t.end();

  });

  test('no requested layers should use everything', (t) => {
    // this test is used to test coarse reverse fallback for when non-coarse reverse
    //  was requested but no non-coarse results were found

    // by plan'ing the number of tests, we can verify that next() was called w/o
    //  additional bookkeeping
    t.plan(4);

    const service = (req, callback) => {
      const results = {
        neighbourhood: [
          {
            id: 10,
            name: 'neighbourhood name',
            abbr: 'neighbourhood abbr'
          }
        ]
      };

      callback(undefined, results);
    };

    const logger = require('pelias-mock-logger')();

    const controller = proxyquire('../../../controller/coarse_reverse', {
      'pelias-logger': logger
    })(service, _.constant(true));

    const req = {
      clean: {
        layers: [],
        point: {
          lat: 12.121212,
          lon: 21.212121
        }
      }
    };

    const res = { };

    // verify that next was called
    const next = () => {
      t.pass('next() should have been called');
    };

    controller(req, res, next);

    const expected = {
      meta: {},
      data: [
        {
          _id: '10',
          _type: 'neighbourhood',
          layer: 'neighbourhood',
          source: 'whosonfirst',
          source_id: '10',
          name: {
            'default': 'neighbourhood name'
          },
          phrase: {
            'default': 'neighbourhood name'
          },
          parent: {
            neighbourhood: ['neighbourhood name'],
            neighbourhood_id: ['10'],
            neighbourhood_a: ['neighbourhood abbr']
          }
        }
      ]
    };

    t.deepEquals(req.clean.layers, [], 'req.clean.layers should be unmodified');
    t.deepEquals(res, expected);
    t.notOk(logger.hasErrorMessages());

    t.end();

  });

  test('layers specifying only venue, address, or street should not exclude coarse results', (t) => {
    // this test is used to test coarse reverse fallback for when non-coarse reverse
    //  was requested but no non-coarse results were found
    const non_coarse_layers = ['venue', 'address', 'street'];
    const tests_per_non_coarse_layer = 4;

    // by plan'ing the number of tests, we can verify that next() was called w/o
    //  additional bookkeeping
    t.plan(non_coarse_layers.length * tests_per_non_coarse_layer);

    non_coarse_layers.forEach((non_coarse_layer) => {
      const service = (req, callback) => {
        const results = {
          neighbourhood: [
            {
              id: 10,
              name: 'neighbourhood name',
              abbr: 'neighbourhood abbr'
            }
          ]
        };

        callback(undefined, results);
      };

      const logger = require('pelias-mock-logger')();

      const controller = proxyquire('../../../controller/coarse_reverse', {
        'pelias-logger': logger
      })(service, _.constant(true));

      const req = {
        clean: {
          layers: [non_coarse_layer],
          point: {
            lat: 12.121212,
            lon: 21.212121
          }
        }
      };

      const res = { };

      // verify that next was called
      const next = () => {
        t.pass('next() should have been called');
      };

      controller(req, res, next);

      const expected = {
        meta: {},
        data: [
          {
            _id: '10',
            _type: 'neighbourhood',
            layer: 'neighbourhood',
            source: 'whosonfirst',
            source_id: '10',
            name: {
              'default': 'neighbourhood name'
            },
            phrase: {
              'default': 'neighbourhood name'
            },
            parent: {
              neighbourhood: ['neighbourhood name'],
              neighbourhood_id: ['10'],
              neighbourhood_a: ['neighbourhood abbr']
            }
          }
        ]
      };

      t.deepEquals(req.clean.layers, [non_coarse_layer], 'req.clean.layers should be unmodified');
      t.deepEquals(res, expected);
      t.notOk(logger.hasErrorMessages());

    });

    t.end();

  });

  test('layers specifying venue, address, or street AND coarse layer should not exclude coarse results', (t) => {
    // this test is used to test coarse reverse fallback for when non-coarse reverse
    //  was requested but no non-coarse results were found
    const non_coarse_layers = ['venue', 'address', 'street'];
    const tests_per_non_coarse_layer = 4;

    // by plan'ing the number of tests, we can verify that next() was called w/o
    //  additional bookkeeping
    t.plan(non_coarse_layers.length * tests_per_non_coarse_layer);

    non_coarse_layers.forEach((non_coarse_layer) => {
      const service = (req, callback) => {
        const results = {
          neighbourhood: [
            {
              id: 10,
              name: 'neighbourhood name',
              abbr: 'neighbourhood abbr'
            }
          ]
        };

        callback(undefined, results);
      };

      const logger = require('pelias-mock-logger')();

      const controller = proxyquire('../../../controller/coarse_reverse', {
        'pelias-logger': logger
      })(service, _.constant(true));

      const req = {
        clean: {
          layers: [non_coarse_layer, 'neighbourhood'],
          point: {
            lat: 12.121212,
            lon: 21.212121
          }
        }
      };

      const res = { };

      // verify that next was called
      const next = () => {
        t.pass('next() should have been called');
      };

      controller(req, res, next);

      const expected = {
        meta: {},
        data: [
          {
            _id: '10',
            _type: 'neighbourhood',
            layer: 'neighbourhood',
            source: 'whosonfirst',
            source_id: '10',
            name: {
              'default': 'neighbourhood name'
            },
            phrase: {
              'default': 'neighbourhood name'
            },
            parent: {
              neighbourhood: ['neighbourhood name'],
              neighbourhood_id: ['10'],
              neighbourhood_a: ['neighbourhood abbr']
            }
          }
        ]
      };

      t.deepEquals(req.clean.layers, [non_coarse_layer, 'neighbourhood'], 'req.clean.layers should be unmodified');
      t.deepEquals(res, expected);
      t.notOk(logger.hasErrorMessages());

    });

    t.end();

  });

};

module.exports.tests.failure_conditions = (test, common) => {
  test('service returning 0 results at the requested layer should return nothing', (t) => {
    t.plan(4);

    const service = (req, callback) => {
      t.deepEquals(req, { clean: { layers: ['neighbourhood'] } } );

      // response without neighbourhood results
      const results = {
        borough: [
          { id: 20, name: 'borough name', abbr: 'borough abbr'},
          { id: 21, name: 'borough name 2'}
        ],
        locality: [
          { id: 30, name: 'locality name', abbr: 'locality abbr'},
          { id: 31, name: 'locality name 2'}
        ],
        localadmin: [
          { id: 40, name: 'localadmin name', abbr: 'localadmin abbr'},
          { id: 41, name: 'localadmin name 2'}
        ],
        county: [
          { id: 50, name: 'county name', abbr: 'county abbr'},
          { id: 51, name: 'county name 2'}
        ],
        macrocounty: [
          { id: 60, name: 'macrocounty name', abbr: 'macrocounty abbr'},
          { id: 61, name: 'macrocounty name 2'}
        ],
        region: [
          { id: 70, name: 'region name', abbr: 'region abbr'},
          { id: 71, name: 'region name 2'}
        ],
        macroregion: [
          { id: 80, name: 'macroregion name', abbr: 'macroregion abbr'},
          { id: 81, name: 'macroregion name 2'}
        ],
        dependency: [
          { id: 90, name: 'dependency name', abbr: 'dependency abbr'},
          { id: 91, name: 'dependency name 2'}
        ],
        country: [
          { id: 100, name: 'country name', abbr: 'xyz'},
          { id: 101, name: 'country name 2'}
        ]
      };

      callback(undefined, results);
    };

    const logger = require('pelias-mock-logger')();

    const controller = proxyquire('../../../controller/coarse_reverse', {
      'pelias-logger': logger
    })(service, _.constant(true));

    const req = {
      clean: {
        layers: ['neighbourhood']
      }
    };

    const res = { };

    // verify that next was called
    const next = () => {
      t.pass('next() was called');
    };

    controller(req, res, next);

    const expected = {
      meta: {},
      data: []
    };

    t.deepEquals(res, expected);
    t.notOk(logger.hasErrorMessages());
    t.end();

  });

};

module.exports.all = (tape, common) => {

  function test(name, testFunction) {
    return tape(`GET /coarse_reverse ${name}`, testFunction);
  }

  for( const testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
