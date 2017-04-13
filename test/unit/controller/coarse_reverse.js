'use strict';

const setup = require('../../../controller/coarse_reverse');
const proxyquire =  require('proxyquire').noCallThru();

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
    const service = () => {
      throw Error('service should not have been called');
    };

    const should_execute = () => { return false; };
    const controller = setup(service, should_execute);

    const req = {
      clean: {
        layers: ['locality']
      },
      errors: ['error']
    };

    // verify that next was called
    let next_was_called = false;
    const next = () => {
      next_was_called = true;
    };

    // passing res=undefined verifies that it wasn't interacted with
    t.doesNotThrow(controller.bind(null, req, undefined, next));
    t.ok(next_was_called);
    t.end();

  });

};

module.exports.tests.error_conditions = (test, common) => {
  test('service error should log and call next', (t) => {
    const service = (point, callback) => {
      callback('this is an error');
    };

    const logger = require('pelias-mock-logger')();

    const should_execute = () => { return true; };
    const controller = proxyquire('../../../controller/coarse_reverse', {
      'pelias-logger': logger
    })(service, should_execute);

    const req = {
      clean: {
        layers: ['locality'],
        point: {
          lat: 12.121212,
          lon: 21.212121
        }
      }
    };

    // verify that next was called
    let next_was_called = false;
    const next = () => {
      next_was_called = true;
    };

    // passing res=undefined verifies that it wasn't interacted with
    controller(req, undefined, next);

    t.ok(logger.isErrorMessage('this is an error'));
    t.ok(next_was_called);
    t.end();

  });

};

module.exports.tests.success_conditions = (test, common) => {
  test('service returning results should use first entry for each layer', (t) => {
    const service = (point, callback) => {
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

    const should_execute = () => { return true; };
    const controller = proxyquire('../../../controller/coarse_reverse', {
      'pelias-logger': logger
    })(service, should_execute);

    const req = {
      clean: {
        layers: ['neighbourhood'],
        point: {
          lat: 12.121212,
          lon: 21.212121
        }
      }
    };

    const res = { };

    // verify that next was called
    let next_was_called = false;
    const next = () => {
      next_was_called = true;
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
          alpha3: 'XYZ',
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
    t.ok(next_was_called);
    t.end();

  });

  test('layers missing from results should be ignored', (t) => {
    const service = (point, callback) => {
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
          }
        ]
      };

      callback(undefined, results);
    };

    const logger = require('pelias-mock-logger')();

    const should_execute = () => { return true; };
    const controller = proxyquire('../../../controller/coarse_reverse', {
      'pelias-logger': logger
    })(service, should_execute);

    const req = {
      clean: {
        layers: ['neighbourhood'],
        point: {
          lat: 12.121212,
          lon: 21.212121
        }
      }
    };

    const res = { };

    // verify that next was called
    let next_was_called = false;
    const next = () => {
      next_was_called = true;
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
          },
          bounding_box: '{"min_lat":40.006751,"max_lat":40.072939,"min_lon":-76.345902,"max_lon":-76.254038}'
        }
      ]
    };

    t.deepEquals(res, expected);

    t.notOk(logger.hasErrorMessages());
    t.ok(next_was_called);
    t.end();

  });

  test('most granular layer missing centroid should not set', (t) => {
    const service = (point, callback) => {
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

    const should_execute = () => { return true; };
    const controller = proxyquire('../../../controller/coarse_reverse', {
      'pelias-logger': logger
    })(service, should_execute);

    const req = {
      clean: {
        layers: ['neighbourhood'],
        point: {
          lat: 12.121212,
          lon: 21.212121
        }
      }
    };

    const res = { };

    // verify that next was called
    let next_was_called = false;
    const next = () => {
      next_was_called = true;
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
    t.ok(next_was_called);
    t.end();

  });

  test('most granular layer missing bounding_box should not set', (t) => {
    const service = (point, callback) => {
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

    const should_execute = () => { return true; };
    const controller = proxyquire('../../../controller/coarse_reverse', {
      'pelias-logger': logger
    })(service, should_execute);

    const req = {
      clean: {
        layers: ['neighbourhood'],
        point: {
          lat: 12.121212,
          lon: 21.212121
        }
      }
    };

    const res = { };

    // verify that next was called
    let next_was_called = false;
    const next = () => {
      next_was_called = true;
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
    t.ok(next_was_called);
    t.end();

  });

};

module.exports.tests.failure_conditions = (test, common) => {
  test('service returning 0 results at the requested layer should return nothing', (t) => {
    const service = (point, callback) => {
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

    const should_execute = () => { return true; };
    const controller = proxyquire('../../../controller/coarse_reverse', {
      'pelias-logger': logger
    })(service, should_execute);

    const req = {
      clean: {
        layers: ['neighbourhood'],
        point: {
          lat: 12.121212,
          lon: 21.212121
        }
      }
    };

    const res = { };

    // verify that next was called
    let next_was_called = false;
    const next = () => {
      next_was_called = true;
    };

    controller(req, res, next);

    const expected = {
      meta: {},
      data: []
    };

    t.deepEquals(res, expected);

    t.notOk(logger.hasErrorMessages());
    t.ok(next_was_called);
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
