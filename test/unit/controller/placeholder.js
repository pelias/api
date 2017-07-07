'use strict';

const placeholder = require('../../../controller/placeholder');
const proxyquire =  require('proxyquire').noCallThru();
const mock_logger = require('pelias-mock-logger');
const _ = require('lodash');

module.exports.tests = {};

module.exports.tests.interface = (test, common) => {
  test('valid interface', (t) => {
    t.equal(typeof placeholder, 'function', 'placeholder is a function');
    t.equal(typeof placeholder(), 'function', 'placeholder returns a controller');
    t.end();
  });
};

module.exports.tests.should_execute = (test, common) => {
  test('should_execute returning false should not call service', (t) => {
    let placeholder_service_was_called = false;

    const placeholder_service = () => {
      placeholder_service_was_called = true;
    };

    const should_execute = (req, res) => {
      // req and res should be passed to should_execute
      t.deepEquals(req, { a: 1 });
      t.deepEquals(res, { b: 2 });
      return false;
    };

    const controller = placeholder(placeholder_service, true, should_execute);

    const req = { a: 1 };
    const res = { b: 2 };

    controller(req, res, () => {
      t.notOk(placeholder_service_was_called);
      t.deepEquals(res, { b: 2 });
      t.end();
    });

  });

  test('should_execute returning true should call service', (t) => {
    let placeholder_service_was_called = false;

    const placeholder_service = (req, callback) => {
      t.deepEqual(req, { param1: 'param1 value' });
      placeholder_service_was_called = true;
      callback(null, []);
    };

    const controller = placeholder(placeholder_service, true, () => true);

    const req = { param1: 'param1 value' };
    const res = { b: 2 };

    controller(req, res, () => {
      t.ok(placeholder_service_was_called);
      t.deepEquals(res.data, []);
      t.end();
    });

  });

};

module.exports.tests.success = (test, common) => {
  test('response from service should be converted', (t) => {
    const logger = mock_logger();

    const placeholder_service = (req, callback) => {
      t.deepEqual(req, { param1: 'param1 value' });

      const response = [
        {
          id: 123,
          name: 'name 1',
          placetype: 'neighbourhood',
          population: 1234,
          popularity: 5678,
          lineage: [
            {
              country: {
                id: 1,
                name: 'country name 1',
                abbr: 'ABC'
              },
              dependency: {
                id: 2,
                name: 'dependency name 1'
              },
              macroregion: {
                id: 3,
                name: 'macroregion name 1'
              },
              region: {
                id: 4,
                name: 'region name 1'
              },
              macrocounty: {
                id: 5,
                name: 'macrocounty name 1'
              },
              county: {
                id: 6,
                name: 'county name 1'
              },
              localadmin: {
                id: 7,
                name: 'localadmin name 1'
              },
              locality: {
                id: 8,
                name: 'locality name 1'
              },
              borough: {
                id: 9,
                name: 'borough name 1'
              },
              neighbourhood: {
                id: 10,
                name: 'neighbourhood name 1'
              }
            },
            {
              country: {
                id: 11,
                name: 'country name 2',
                abbr: 'XYZ'
              },
              dependency: {
                id: 12,
                name: 'dependency name 2',
                abbr: 'dependency abbr 2'
              },
              macroregion: {
                id: 13,
                name: 'macroregion name 2',
                abbr: 'macroregion abbr 2'
              },
              region: {
                id: 14,
                name: 'region name 2',
                abbr: 'region abbr 2'
              },
              macrocounty: {
                id: 15,
                name: 'macrocounty name 2',
                abbr: 'macrocounty abbr 2'
              },
              county: {
                id: 16,
                name: 'county name 2',
                abbr: 'county abbr 2'
              },
              localadmin: {
                id: 17,
                name: 'localadmin name 2',
                abbr: 'localadmin abbr 2'
              },
              locality: {
                id: 18,
                name: 'locality name 2',
                abbr: 'locality abbr 2'
              },
              borough: {
                id: 19,
                name: 'borough name 2',
                abbr: 'borough abbr 2'
              },
              neighbourhood: {
                id: 20,
                name: 'neighbourhood name 2',
                abbr: 'neighbourhood abbr 2'
              }
            }
          ],
          geom: {
            area: 12.34,
            bbox: '21.212121,12.121212,31.313131,13.131313',
            lat: 14.141414,
            lon: 41.414141
          }
        },
        {
          id: 456,
          name: 'name 3',
          placetype: 'locality',
          population: 4321,
          popularity: 8765,
          lineage: [ {} ],
          geom: {
            area: 23.45,
            bbox: '51.515151,15.151515,61.616161,16.161616',
            lat: 17.171717,
            lon: 71.717171
          }
        }
      ];

      callback(null, response);
    };

    const controller = proxyquire('../../../controller/placeholder', {
      'pelias-logger': logger
    })(placeholder_service, true, () => true);

    const req = { param1: 'param1 value' };
    const res = { };

    controller(req, res, () => {
      const expected_res = {
        meta: {
          query_type: 'fallback'
        },
        data: [
          {
            _id: '123',
            _type: 'neighbourhood',
            layer: 'neighbourhood',
            source: 'whosonfirst',
            source_id: '123',
            center_point: {
              lat: 14.141414,
              lon: 41.414141
            },
            bounding_box: '{"min_lat":12.121212,"max_lat":13.131313,"min_lon":21.212121,"max_lon":31.313131}',
            name: {
              'default': 'name 1'
            },
            phrase: {
              'default': 'name 1'
            },
            population: 1234,
            popularity: 5678,
            parent: {
              neighbourhood: ['neighbourhood name 1', 'neighbourhood name 2'],
              neighbourhood_id: ['10', '20'],
              neighbourhood_a: [null, 'neighbourhood abbr 2'],
              borough: ['borough name 1', 'borough name 2'],
              borough_id: ['9', '19'],
              borough_a: [null, 'borough abbr 2'],
              locality: ['locality name 1', 'locality name 2'],
              locality_id: ['8', '18'],
              locality_a: [null, 'locality abbr 2'],
              localadmin: ['localadmin name 1', 'localadmin name 2'],
              localadmin_id: ['7', '17'],
              localadmin_a: [null, 'localadmin abbr 2'],
              county: ['county name 1', 'county name 2'],
              county_id: ['6', '16'],
              county_a: [null, 'county abbr 2'],
              macrocounty: ['macrocounty name 1', 'macrocounty name 2'],
              macrocounty_id: ['5', '15'],
              macrocounty_a: [null, 'macrocounty abbr 2'],
              region: ['region name 1', 'region name 2'],
              region_id: ['4', '14'],
              region_a: [null, 'region abbr 2'],
              macroregion: ['macroregion name 1', 'macroregion name 2'],
              macroregion_id: ['3', '13'],
              macroregion_a: [null, 'macroregion abbr 2'],
              dependency: ['dependency name 1', 'dependency name 2'],
              dependency_id: ['2', '12'],
              dependency_a: [null, 'dependency abbr 2'],
              country: ['country name 1', 'country name 2'],
              country_id: ['1', '11'],
              country_a: ['ABC', 'XYZ']
            }
          },
          {
            _id: '456',
            _type: 'locality',
            layer: 'locality',
            source: 'whosonfirst',
            source_id: '456',
            center_point: {
              lat: 17.171717,
              lon: 71.717171
            },
            bounding_box: '{"min_lat":15.151515,"max_lat":16.161616,"min_lon":51.515151,"max_lon":61.616161}',
            name: {
              'default': 'name 3'
            },
            phrase: {
              'default': 'name 3'
            },
            population: 4321,
            popularity: 8765
          }
        ]
      };

      t.deepEquals(res, expected_res);
      t.ok(logger.isInfoMessage('[controller:placeholder] [result_count:2]'));
      t.end();
    });

  });

  test('results with no lineage should not set any parent fields', (t) => {
    const logger = require('pelias-mock-logger')();

    const placeholder_service = (req, callback) => {
      t.deepEqual(req, { param1: 'param1 value' });

      const response = [
        {
          id: 123,
          name: 'name 1',
          placetype: 'neighbourhood',
          geom: {
            area: 12.34,
            bbox: '21.212121,12.121212,31.313131,13.131313',
            lat: 14.141414,
            lon: 41.414141
          }
        }
      ];

      callback(null, response);
    };

    const controller = proxyquire('../../../controller/placeholder', {
      'pelias-logger': logger
    })(placeholder_service, true, () => true);

    const req = { param1: 'param1 value' };
    const res = { };

    controller(req, res, () => {
      const expected_res = {
        meta: {
          query_type: 'fallback'
        },
        data: [
          {
            _id: '123',
            _type: 'neighbourhood',
            layer: 'neighbourhood',
            source: 'whosonfirst',
            source_id: '123',
            center_point: {
              lat: 14.141414,
              lon: 41.414141
            },
            bounding_box: '{"min_lat":12.121212,"max_lat":13.131313,"min_lon":21.212121,"max_lon":31.313131}',
            name: {
              'default': 'name 1'
            },
            phrase: {
              'default': 'name 1'
            }
          }
        ]
      };

      t.deepEquals(res, expected_res);
      t.ok(logger.isInfoMessage('[controller:placeholder] [result_count:1]'));
      t.end();
    });

  });

  test('results with string population/popularity should convert to number', (t) => {
    const logger = require('pelias-mock-logger')();

    const placeholder_service = (req, callback) => {
      t.deepEqual(req, { param1: 'param1 value' });

      const response = [
        {
          id: 123,
          name: 'name 1',
          placetype: 'neighbourhood',
          population: '123.4',
          popularity: '567.8',
          geom: {
            area: 12.34
          }
        }
      ];

      callback(null, response);
    };

    const controller = proxyquire('../../../controller/placeholder', {
      'pelias-logger': logger
    })(placeholder_service, true, () => true);

    const req = { param1: 'param1 value' };
    const res = { };

    controller(req, res, () => {
      const expected_res = {
        meta: {
          query_type: 'fallback'
        },
        data: [
          {
            _id: '123',
            _type: 'neighbourhood',
            layer: 'neighbourhood',
            source: 'whosonfirst',
            source_id: '123',
            population: 123.4,
            popularity: 568,
            name: {
              'default': 'name 1'
            },
            phrase: {
              'default': 'name 1'
            }
          }
        ]
      };

      t.deepEquals(res, expected_res);
      t.ok(logger.isInfoMessage('[controller:placeholder] [result_count:1]'));
      t.end();
    });

  });

  test('results with negative population/popularity should not set population/popularity', (t) => {
    const logger = require('pelias-mock-logger')();

    const placeholder_service = (req, callback) => {
      t.deepEqual(req, { param1: 'param1 value' });

      const response = [
        {
          id: 123,
          name: 'name 1',
          placetype: 'neighbourhood',
          population: -1,
          popularity: -1,
          geom: {
            area: 12.34
          }
        }
      ];

      callback(null, response);
    };

    const controller = proxyquire('../../../controller/placeholder', {
      'pelias-logger': logger
    })(placeholder_service, true, () => true);

    const req = { param1: 'param1 value' };
    const res = { };

    controller(req, res, () => {
      const expected_res = {
        meta: {
          query_type: 'fallback'
        },
        data: [
          {
            _id: '123',
            _type: 'neighbourhood',
            layer: 'neighbourhood',
            source: 'whosonfirst',
            source_id: '123',
            name: {
              'default': 'name 1'
            },
            phrase: {
              'default': 'name 1'
            }
          }
        ]
      };

      t.deepEquals(res, expected_res);
      t.ok(logger.isInfoMessage('[controller:placeholder] [result_count:1]'));
      t.end();
    });

  });

  test('results with undefined or empty name should be skipped', (t) => {
    [undefined, '', ' \t '].forEach((invalid_name) => {
      const logger = require('pelias-mock-logger')();

      const placeholder_service = (req, callback) => {
        t.deepEqual(req, { param1: 'param1 value' });

        const response = [
          {
            id: 123,
            name: invalid_name,
            placetype: 'neighbourhood',
            geom: {
              area: 12.34
            }
          },
          {
            id: 456,
            name: 'name 2',
            placetype: 'neighbourhood',
            geom: {
              area: 12.34
            }
          }
        ];

        callback(null, response);
      };

      const controller = proxyquire('../../../controller/placeholder', {
        'pelias-logger': logger
      })(placeholder_service, true, () => true);

      const req = { param1: 'param1 value' };
      const res = { };

      controller(req, res, () => {
        const expected_res = {
          meta: {
            query_type: 'fallback'
          },
          data: [
            {
              _id: '456',
              _type: 'neighbourhood',
              layer: 'neighbourhood',
              source: 'whosonfirst',
              source_id: '456',
              name: {
                'default': 'name 2'
              },
              phrase: {
                'default': 'name 2'
              }
            }
          ]
        };

        t.deepEquals(res, expected_res);
        t.ok(logger.isInfoMessage('[controller:placeholder] [result_count:1]'));
      });

    });

    t.end();

  });

  test('results with string geom.lat/geom.lon should convert to numbers', (t) => {
    const logger = require('pelias-mock-logger')();

    const placeholder_service = (req, callback) => {
      t.deepEqual(req, { param1: 'param1 value' });

      const response = [
        {
          id: 1,
          name: 'name 1',
          placetype: 'neighbourhood',
          geom: {
            area: 12.34,
            lat: '14.141414',
            lon: '41.414141'
          }
        }
      ];

      callback(null, response);
    };

    const should_execute = (req, res) => {
      return true;
    };

    const controller = proxyquire('../../../controller/placeholder', {
      'pelias-logger': logger
    })(placeholder_service, true, () => true);

    const req = { param1: 'param1 value' };
    const res = { };

    controller(req, res, () => {
      const expected_res = {
        meta: {
          query_type: 'fallback'
        },
        data: [
          {
            _id: '1',
            _type: 'neighbourhood',
            layer: 'neighbourhood',
            source: 'whosonfirst',
            source_id: '1',
            center_point: {
              lat: 14.141414,
              lon: 41.414141
            },
            name: {
              'default': 'name 1'
            },
            phrase: {
              'default': 'name 1'
            }
          }
        ]
      };

      t.deepEquals(res, expected_res);
      t.ok(logger.isInfoMessage('[controller:placeholder] [result_count:1]'));
      t.end();
    });

  });

};

module.exports.tests.result_filtering = (test, common) => {
  test('when boundary.rect is available, results outside of it should be removed', (t) => {
    const logger = require('pelias-mock-logger')();

    const placeholder_service = (req, callback) => {
      t.deepEqual(req, {
        param1: 'param1 value',
        clean: {
          'boundary.rect.min_lat': -2,
          'boundary.rect.max_lat': 2,
          'boundary.rect.min_lon': -2,
          'boundary.rect.max_lon': 2
        }
      });

      const response = [
        {
          // inside bbox
          id: 1,
          name: 'name 1',
          placetype: 'neighbourhood',
          geom: {
            lat: -1,
            lon: -1
          }
        },
        {
          // outside bbox on max_lon
          id: 2,
          name: 'name 2',
          placetype: 'neighbourhood',
          geom: {
            lat: -1,
            lon: 3
          }
        },
        {
          // outside bbox on max_lat
          id: 3,
          name: 'name 3',
          placetype: 'neighbourhood',
          geom: {
            lat: 3,
            lon: -1
          }
        },
        {
          // outside bbox on min_lon
          id: 4,
          name: 'name 4',
          placetype: 'neighbourhood',
          geom: {
            lat: -1,
            lon: -3
          }
        },
        {
          // outside bbox on min_lat
          id: 5,
          name: 'name 5',
          placetype: 'neighbourhood',
          geom: {
            lat: -3,
            lon: -1
          }
        },
        {
          // no lat/lon
          id: 6,
          name: 'name 6',
          placetype: 'neighbourhood',
          geom: {
          }
        },
        {
          // empty string lat/lon
          id: 7,
          name: 'name 7',
          placetype: 'neighbourhood',
          geom: {
            lat: '',
            lon: ''
          }
        },
        {
          // valid lat, empty string lon
          id: 8,
          name: 'name 8',
          placetype: 'neighbourhood',
          geom: {
            lat: 0,
            lon: ' '
          }
        },
        {
          // valid lon, empty string lat
          id: 9,
          name: 'name 9',
          placetype: 'neighbourhood',
          geom: {
            lat: ' ',
            lon: 0
          }
        },
        {
          // inside bbox
          id: 10,
          name: 'name 10',
          placetype: 'neighbourhood',
          geom: {
            lat: 1,
            lon: 1
          }
        }
      ];

      callback(null, response);
    };

    const should_execute = (req, res) => {
      return true;
    };

    const controller = proxyquire('../../../controller/placeholder', {
      'pelias-logger': logger
    })(placeholder_service, true, () => true);

    const req = {
      param1: 'param1 value',
      clean: {
        'boundary.rect.min_lat': -2,
        'boundary.rect.max_lat': 2,
        'boundary.rect.min_lon': -2,
        'boundary.rect.max_lon': 2
      }
    };
    const res = { };

    controller(req, res, () => {
      const expected_res = {
        meta: {
          query_type: 'fallback'
        },
        data: [
          {
            _id: '1',
            _type: 'neighbourhood',
            layer: 'neighbourhood',
            source: 'whosonfirst',
            source_id: '1',
            center_point: {
              lat: -1,
              lon: -1
            },
            name: {
              'default': 'name 1'
            },
            phrase: {
              'default': 'name 1'
            }
          },
          {
            _id: '10',
            _type: 'neighbourhood',
            layer: 'neighbourhood',
            source: 'whosonfirst',
            source_id: '10',
            center_point: {
              lat: 1,
              lon: 1
            },
            name: {
              'default': 'name 10'
            },
            phrase: {
              'default': 'name 10'
            }
          }
        ]
      };

      t.deepEquals(res, expected_res);
      t.end();
    });

  });

  test('when geometric_filters_apply is false, boundary.rect should not apply', (t) => {
    const logger = require('pelias-mock-logger')();

    const placeholder_service = (req, callback) => {
      t.deepEqual(req, {
        param1: 'param1 value',
        clean: {
          'boundary.rect.min_lat': -1,
          'boundary.rect.max_lat': 1,
          'boundary.rect.min_lon': -1,
          'boundary.rect.max_lon': 1
        }
      });

      const response = [
        {
          // inside bbox
          id: 1,
          name: 'name 1',
          placetype: 'neighbourhood',
          geom: {
            lat: 0,
            lon: 0
          }
        },
        {
          // outside bbox
          id: 2,
          name: 'name 2',
          placetype: 'neighbourhood',
          geom: {
            lat: -2,
            lon: 2
          }
        },
        {
          // outside bbox
          id: 3,
          name: 'name 3',
          placetype: 'neighbourhood',
          geom: {
            lat: 2,
            lon: -2
          }
        }
      ];

      callback(null, response);
    };

    const should_execute = (req, res) => {
      return true;
    };

    const controller = proxyquire('../../../controller/placeholder', {
      'pelias-logger': logger
    })(placeholder_service, false, () => true);

    const req = {
      param1: 'param1 value',
      clean: {
        'boundary.rect.min_lat': -1,
        'boundary.rect.max_lat': 1,
        'boundary.rect.min_lon': -1,
        'boundary.rect.max_lon': 1
      }
    };
    const res = { };

    controller(req, res, () => {
      const expected_res = {
        meta: {
          query_type: 'fallback'
        },
        data: [
          {
            _id: '1',
            _type: 'neighbourhood',
            layer: 'neighbourhood',
            source: 'whosonfirst',
            source_id: '1',
            center_point: {
              lat: 0,
              lon: 0
            },
            name: {
              'default': 'name 1'
            },
            phrase: {
              'default': 'name 1'
            }
          },
          {
            _id: '2',
            _type: 'neighbourhood',
            layer: 'neighbourhood',
            source: 'whosonfirst',
            source_id: '2',
            center_point: {
              lat: -2,
              lon: 2
            },
            name: {
              'default': 'name 2'
            },
            phrase: {
              'default': 'name 2'
            }
          },
          {
            _id: '3',
            _type: 'neighbourhood',
            layer: 'neighbourhood',
            source: 'whosonfirst',
            source_id: '3',
            center_point: {
              lat: 2,
              lon: -2
            },
            name: {
              'default': 'name 3'
            },
            phrase: {
              'default': 'name 3'
            }
          }
        ]
      };

      t.deepEquals(res, expected_res);
      t.end();
    });

  });

  test('when boundary.circle is available, results outside of it should be removed', (t) => {
    const logger = require('pelias-mock-logger')();

    const placeholder_service = (req, callback) => {
      t.deepEqual(req, {
        param1: 'param1 value',
        clean: {
          'boundary.circle.lat': 0,
          'boundary.circle.lon': 0,
          'boundary.circle.radius': 500
        }
      });

      const response = [
        {
          // inside circle
          id: 1,
          name: 'name 1',
          placetype: 'neighbourhood',
          geom: {
            lat: 1,
            lon: 1
          }
        },
        {
          // outside circle on +lon
          id: 2,
          name: 'name 2',
          placetype: 'neighbourhood',
          geom: {
            lat: 0,
            lon: 45
          }
        },
        {
          // outside bbox on +lat
          id: 3,
          name: 'name 3',
          placetype: 'neighbourhood',
          geom: {
            lat: 45,
            lon: 0
          }
        },
        {
          // outside bbox on -lon
          id: 4,
          name: 'name 4',
          placetype: 'neighbourhood',
          geom: {
            lat: 0,
            lon: -45
          }
        },
        {
          // outside bbox on -lat
          id: 5,
          name: 'name 5',
          placetype: 'neighbourhood',
          geom: {
            lat: -45,
            lon: 0
          }
        },
        {
          // no lat/lon
          id: 6,
          name: 'name 6',
          placetype: 'neighbourhood',
          geom: {
          }
        },
        {
          // empty string lat/lon
          id: 7,
          name: 'name 7',
          placetype: 'neighbourhood',
          geom: {
            lat: '',
            lon: ''
          }
        },
        {
          // valid lat, empty string lon
          id: 8,
          name: 'name 8',
          placetype: 'neighbourhood',
          geom: {
            lat: 0,
            lon: ' '
          }
        },
        {
          // valid lon, empty string lat
          id: 9,
          name: 'name 9',
          placetype: 'neighbourhood',
          geom: {
            lat: ' ',
            lon: 0
          }
        },
        {
          // inside circle
          id: 10,
          name: 'name 10',
          placetype: 'neighbourhood',
          geom: {
            lat: -1,
            lon: -1
          }
        }
      ];

      callback(null, response);
    };

    const should_execute = (req, res) => {
      return true;
    };

    const controller = proxyquire('../../../controller/placeholder', {
      'pelias-logger': logger
    })(placeholder_service, true, () => true);

    const req = {
      param1: 'param1 value',
      clean: {
        'boundary.circle.lat': 0,
        'boundary.circle.lon': 0,
        'boundary.circle.radius': 500
      }
    };
    const res = { };

    controller(req, res, () => {
      const expected_res = {
        meta: {
          query_type: 'fallback'
        },
        data: [
          {
            _id: '1',
            _type: 'neighbourhood',
            layer: 'neighbourhood',
            source: 'whosonfirst',
            source_id: '1',
            center_point: {
              lat: 1,
              lon: 1
            },
            name: {
              'default': 'name 1'
            },
            phrase: {
              'default': 'name 1'
            }
          },
          {
            _id: '10',
            _type: 'neighbourhood',
            layer: 'neighbourhood',
            source: 'whosonfirst',
            source_id: '10',
            center_point: {
              lat: -1,
              lon: -1
            },
            name: {
              'default': 'name 10'
            },
            phrase: {
              'default': 'name 10'
            }
          }
        ]
      };

      t.deepEquals(res, expected_res);
      t.end();
    });

  });

  test('when geometric_filters_apply is false, boundary.circle should not apply', (t) => {
    const logger = require('pelias-mock-logger')();

    const placeholder_service = (req, callback) => {
      t.deepEqual(req, {
        param1: 'param1 value',
        clean: {
          'boundary.circle.lat': 0,
          'boundary.circle.lon': 0,
          'boundary.circle.radius': 500
        }
      });

      const response = [
        {
          // inside circle
          id: 1,
          name: 'name 1',
          placetype: 'neighbourhood',
          geom: {
            lat: 1,
            lon: 1
          }
        },
        {
          // outside circle on +lon
          id: 2,
          name: 'name 2',
          placetype: 'neighbourhood',
          geom: {
            lat: -45,
            lon: 45
          }
        },
        {
          // outside bbox on +lat
          id: 3,
          name: 'name 3',
          placetype: 'neighbourhood',
          geom: {
            lat: 45,
            lon: -45
          }
        }
      ];

      callback(null, response);
    };

    const should_execute = (req, res) => {
      return true;
    };

    const controller = proxyquire('../../../controller/placeholder', {
      'pelias-logger': logger
    })(placeholder_service, false, () => true);

    const req = {
      param1: 'param1 value',
      clean: {
        'boundary.circle.lat': 0,
        'boundary.circle.lon': 0,
        'boundary.circle.radius': 500
      }
    };
    const res = { };

    controller(req, res, () => {
      const expected_res = {
        meta: {
          query_type: 'fallback'
        },
        data: [
          {
            _id: '1',
            _type: 'neighbourhood',
            layer: 'neighbourhood',
            source: 'whosonfirst',
            source_id: '1',
            center_point: {
              lat: 1,
              lon: 1
            },
            name: {
              'default': 'name 1'
            },
            phrase: {
              'default': 'name 1'
            }
          },
          {
            _id: '2',
            _type: 'neighbourhood',
            layer: 'neighbourhood',
            source: 'whosonfirst',
            source_id: '2',
            center_point: {
              lat: -45,
              lon: 45
            },
            name: {
              'default': 'name 2'
            },
            phrase: {
              'default': 'name 2'
            }
          },
          {
            _id: '3',
            _type: 'neighbourhood',
            layer: 'neighbourhood',
            source: 'whosonfirst',
            source_id: '3',
            center_point: {
              lat: 45,
              lon: -45
            },
            name: {
              'default': 'name 3'
            },
            phrase: {
              'default': 'name 3'
            }
          }
        ]
      };

      t.deepEquals(res, expected_res);
      t.end();
    });

  });

  test('only results matching explicit layers should be returned', (t) => {
    const logger = mock_logger();

    const placeholder_service = (req, callback) => {
      t.deepEqual(req, {
        param1: 'param1 value',
        clean: {
          layers: ['neighbourhood', 'locality', 'county']
        }
      });

      const response = [
        {
          id: 1,
          name: 'name 1',
          placetype: 'neighbourhood',
          lineage: [ {} ],
          geom: {
            area: 1,
            lat: 14.141414,
            lon: 41.414141
          }
        },
        {
          id: 2,
          name: 'name 2',
          placetype: 'borough',
          lineage: [ {} ],
          geom: {
            area: 2,
            lat: 15.151515,
            lon: 51.515151
          }
        },
        {
          id: 3,
          name: 'name 3',
          placetype: 'locality',
          lineage: [ {} ],
          geom: {
            area: 3,
            lat: 16.161616,
            lon: 61.616161
          }
        },
        {
          id: 4,
          name: 'name 4',
          placetype: 'localadmin',
          lineage: [ {} ],
          geom: {
            area: 4,
            lat: 17.171717,
            lon: 71.717171
          }
        },
        {
          id: 5,
          name: 'name 5',
          placetype: 'county',
          lineage: [ {} ],
          geom: {
            area: 5,
            lat: 18.181818,
            lon: 81.818181
          }
        }
      ];

      callback(null, response);
    };

    const controller = proxyquire('../../../controller/placeholder', {
      'pelias-logger': logger
    })(placeholder_service, true, () => true);

    const req = {
      param1: 'param1 value',
      clean: {
        layers: [
          'neighbourhood',
          'locality',
          'county'
        ]
      }
    };
    const res = { };

    controller(req, res, () => {
      const expected_res = {
        meta: {
          query_type: 'fallback'
        },
        data: [
          {
            _id: '1',
            _type: 'neighbourhood',
            layer: 'neighbourhood',
            source: 'whosonfirst',
            source_id: '1',
            center_point: {
              lat: 14.141414,
              lon: 41.414141
            },
            name: {
              'default': 'name 1'
            },
            phrase: {
              'default': 'name 1'
            }
          },
          {
            _id: '3',
            _type: 'locality',
            layer: 'locality',
            source: 'whosonfirst',
            source_id: '3',
            center_point: {
              lat: 16.161616,
              lon: 61.616161
            },
            name: {
              'default': 'name 3'
            },
            phrase: {
              'default': 'name 3'
            }
          },
          {
            _id: '5',
            _type: 'county',
            layer: 'county',
            source: 'whosonfirst',
            source_id: '5',
            center_point: {
              lat: 18.181818,
              lon: 81.818181
            },
            name: {
              'default': 'name 5'
            },
            phrase: {
              'default': 'name 5'
            }
          }
        ]
      };

      t.deepEquals(res, expected_res);
      t.ok(logger.isInfoMessage('[controller:placeholder] [result_count:3]'));
      t.end();
    });

  });

  test('if req.clean.parsed_text contains street, don\'t filter on anything', (t) => {
    const logger = mock_logger();

    const placeholder_service = (req, callback) => {
      t.deepEqual(req, {
        param1: 'param1 value',
        clean: {
          layers: ['neighbourhood'],
          parsed_text: {
            street: 'street value'
          }
        }
      });

      const response = [
        {
          id: 1,
          name: 'name 1',
          placetype: 'neighbourhood',
          lineage: [ {} ],
          geom: {
            area: 1,
            lat: 14.141414,
            lon: 41.414141
          }
        },
        {
          id: 2,
          name: 'name 2',
          placetype: 'borough',
          lineage: [ {} ],
          geom: {
            area: 2,
            lat: 15.151515,
            lon: 51.515151
          }
        },
        {
          id: 3,
          name: 'name 3',
          placetype: 'locality',
          lineage: [ {} ],
          geom: {
            area: 3,
            lat: 16.161616,
            lon: 61.616161
          }
        }
      ];

      callback(null, response);
    };

    const controller = proxyquire('../../../controller/placeholder', {
      'pelias-logger': logger
    })(placeholder_service, true, () => true);

    const req = {
      param1: 'param1 value',
      clean: {
        layers: ['neighbourhood'],
        parsed_text: {
          street: 'street value'
        }
      }
    };
    const res = { };

    controller(req, res, () => {
      const expected_res = {
        meta: {
          query_type: 'fallback'
        },
        data: [
          {
            _id: '1',
            _type: 'neighbourhood',
            layer: 'neighbourhood',
            source: 'whosonfirst',
            source_id: '1',
            center_point: {
              lat: 14.141414,
              lon: 41.414141
            },
            name: {
              'default': 'name 1'
            },
            phrase: {
              'default': 'name 1'
            }
          },
          {
            _id: '2',
            _type: 'borough',
            layer: 'borough',
            source: 'whosonfirst',
            source_id: '2',
            center_point: {
              lat: 15.151515,
              lon: 51.515151
            },
            name: {
              'default': 'name 2'
            },
            phrase: {
              'default': 'name 2'
            }
          },
          {
            _id: '3',
            _type: 'locality',
            layer: 'locality',
            source: 'whosonfirst',
            source_id: '3',
            center_point: {
              lat: 16.161616,
              lon: 61.616161
            },
            name: {
              'default': 'name 3'
            },
            phrase: {
              'default': 'name 3'
            }
          }
        ]
      };

      t.deepEquals(res, expected_res);
      t.ok(logger.isInfoMessage('[controller:placeholder] [result_count:3]'));
      t.end();
    });

  });

  test('only synthesized docs matching explicit boundary.country should be returned', (t) => {
    const logger = require('pelias-mock-logger')();

    const placeholder_service = (req, callback) => {
      t.deepEqual(req, {
        param1: 'param1 value',
        clean: {
          'boundary.country': 'ABC'
        }
      });

      const response = [
        {
          id: 1,
          name: 'name 1',
          placetype: 'locality',
          lineage: [
            {
              country: {
                id: 1,
                name: 'country name 1',
                abbr: 'ABC'
              }
            },
            {
              country: {
                id: 2,
                name: 'country name 2',
                abbr: 'DEF'
              }
            }
          ],
          geom: {
            lat: 14.141414,
            lon: 41.414141
          }
        },
        {
          id: 3,
          name: 'name 3',
          placetype: 'locality',
          lineage: [ {} ],
          geom: {
            lat: 15.151515,
            lon: 51.515151
          }
        },
        {
          id: 4,
          name: 'name 4',
          placetype: 'locality',
          lineage: [
            {
              country: {
                id: 4,
                name: 'country name 4',
                abbr: 'ABC'
              }
            }
          ],
          geom: {
            lat: 16.161616,
            lon: 61.616161
          }
        }
      ];

      callback(null, response);
    };

    const controller = proxyquire('../../../controller/placeholder', {
      'pelias-logger': logger
    })(placeholder_service, true, () => true);

    const req = {
      param1: 'param1 value',
      clean: {
        'boundary.country': 'ABC'
      }
    };
    const res = { };

    controller(req, res, () => {
      const expected_res = {
        meta: {
          query_type: 'fallback'
        },
        data: [
          {
            _id: '1',
            _type: 'locality',
            layer: 'locality',
            source: 'whosonfirst',
            source_id: '1',
            center_point: {
              lat: 14.141414,
              lon: 41.414141
            },
            name: {
              'default': 'name 1'
            },
            phrase: {
              'default': 'name 1'
            },
            parent: {
              country: ['country name 1'],
              country_id: ['1'],
              country_a: ['ABC']
            }
          },
          {
            _id: '4',
            _type: 'locality',
            layer: 'locality',
            source: 'whosonfirst',
            source_id: '4',
            center_point: {
              lat: 16.161616,
              lon: 61.616161
            },
            name: {
              'default': 'name 4'
            },
            phrase: {
              'default': 'name 4'
            },
            parent: {
              country: ['country name 4'],
              country_id: ['4'],
              country_a: ['ABC']
            }
          }
        ]
      };

      t.deepEquals(res, expected_res);
      t.ok(logger.isInfoMessage('[controller:placeholder] [result_count:2]'));
      t.end();
    });

  });

  test('when geometric_filters_apply is false, boundary.country should not apply', (t) => {
    const logger = require('pelias-mock-logger')();

    const placeholder_service = (req, callback) => {
      t.deepEqual(req, {
        param1: 'param1 value',
        clean: {
          'boundary.country': 'ABC'
        }
      });

      const response = [
        {
          id: 1,
          name: 'name 1',
          placetype: 'locality',
          lineage: [
            {
              country: {
                id: 1,
                name: 'country name 1',
                abbr: 'ABC'
              }
            },
            {
              country: {
                id: 2,
                name: 'country name 2',
                abbr: 'DEF'
              }
            }
          ],
          geom: {
            lat: 14.141414,
            lon: 41.414141
          }
        },
        {
          id: 3,
          name: 'name 3',
          placetype: 'locality',
          lineage: [
            {
              country: {
                id: 3,
                name: 'country name 3',
                abbr: 'ABC'
              }
            }
          ],
          geom: {
            lat: 15.151515,
            lon: 51.515151
          }
        },
        {
          id: 4,
          name: 'name 4',
          placetype: 'locality',
          lineage: [
            {
              country: {
                id: 4,
                name: 'country name 4',
                abbr: 'GHI'
              }
            }
          ],
          geom: {
            lat: 16.161616,
            lon: 61.616161
          }
        }
      ];

      callback(null, response);
    };

    const controller = proxyquire('../../../controller/placeholder', {
      'pelias-logger': logger
    })(placeholder_service, false, () => true);

    const req = {
      param1: 'param1 value',
      clean: {
        'boundary.country': 'ABC'
      }
    };
    const res = { };

    controller(req, res, () => {
      const expected_res = {
        meta: {
          query_type: 'fallback'
        },
        data: [
          {
            _id: '1',
            _type: 'locality',
            layer: 'locality',
            source: 'whosonfirst',
            source_id: '1',
            center_point: {
              lat: 14.141414,
              lon: 41.414141
            },
            name: {
              'default': 'name 1'
            },
            phrase: {
              'default': 'name 1'
            },
            parent: {
              country: ['country name 1', 'country name 2'],
              country_id: ['1', '2'],
              country_a: ['ABC', 'DEF']
            }
          },
          {
            _id: '3',
            _type: 'locality',
            layer: 'locality',
            source: 'whosonfirst',
            source_id: '3',
            center_point: {
              lat: 15.151515,
              lon: 51.515151
            },
            name: {
              'default': 'name 3'
            },
            phrase: {
              'default': 'name 3'
            },
            parent: {
              country: ['country name 3'],
              country_id: ['3'],
              country_a: ['ABC']
            }
          },
          {
            _id: '4',
            _type: 'locality',
            layer: 'locality',
            source: 'whosonfirst',
            source_id: '4',
            center_point: {
              lat: 16.161616,
              lon: 61.616161
            },
            name: {
              'default': 'name 4'
            },
            phrase: {
              'default': 'name 4'
            },
            parent: {
              country: ['country name 4'],
              country_id: ['4'],
              country_a: ['GHI']
            }
          }
        ]
      };

      t.deepEquals(res, expected_res);
      t.ok(logger.isInfoMessage('[controller:placeholder] [result_count:3]'));
      t.end();
    });

  });

};

module.exports.tests.lineage_errors = (test, common) => {
  test('unsupported lineage placetypes should be ignored', (t) => {
    const logger = mock_logger();

    const placeholder_service = (req, callback) => {
      t.deepEqual(req, { param1: 'param1 value' });

      const response = [
        {
          id: 123,
          name: 'name 1',
          placetype: 'neighbourhood',
          lineage: [
            {
              country: {
                id: 1,
                name: 'country name 1',
                abbr: 'country abbr 1'
              },
              unknown: {
                id: 2,
                name: 'unknown name 2',
                abbr: 'unknown abbr 2'
              }

            }
          ],
          geom: {
            area: 12.34
          }
        }
      ];

      callback(null, response);
    };

    const controller = proxyquire('../../../controller/placeholder', {
      'pelias-logger': logger
    })(placeholder_service, true, () => true);

    const req = { param1: 'param1 value' };
    const res = { };

    controller(req, res, () => {
      const expected_res = {
        meta: {
          query_type: 'fallback'
        },
        data: [
          {
            _id: '123',
            _type: 'neighbourhood',
            layer: 'neighbourhood',
            source: 'whosonfirst',
            source_id: '123',
            name: {
              'default': 'name 1'
            },
            phrase: {
              'default': 'name 1'
            },
            parent: {
              country: ['country name 1'],
              country_id: ['1'],
              country_a: ['country abbr 1']
            }
          }
        ]
      };

      t.deepEquals(res, expected_res);
      t.end();
    });

  });

  test('lineage placetypes lacking names should be ignored', (t) => {
    const logger = mock_logger();

    const placeholder_service = (req, callback) => {
      t.deepEqual(req, { param1: 'param1 value' });

      const response = [
        {
          id: 123,
          name: 'name 1',
          placetype: 'neighbourhood',
          lineage: [
            {
              country: {
                id: 1,
                name: 'country name 1',
                abbr: 'country abbr 1'
              },
              region: {
                id: 2,
                abbr: 'region abbr 2'
              }

            }
          ],
          geom: {
            area: 12.34
          }
        }
      ];

      callback(null, response);
    };

    const controller = proxyquire('../../../controller/placeholder', {
      'pelias-logger': logger
    })(placeholder_service, true, () => true);

    const req = { param1: 'param1 value' };
    const res = { };

    controller(req, res, () => {
      const expected_res = {
        meta: {
          query_type: 'fallback'
        },
        data: [
          {
            _id: '123',
            _type: 'neighbourhood',
            layer: 'neighbourhood',
            source: 'whosonfirst',
            source_id: '123',
            name: {
              'default': 'name 1'
            },
            phrase: {
              'default': 'name 1'
            },
            parent: {
              country: ['country name 1'],
              country_id: ['1'],
              country_a: ['country abbr 1']
            }
          }
        ]
      };

      t.deepEquals(res, expected_res);
      t.end();
    });

  });

  test('lineage placetypes lacking ids should be ignored', (t) => {
    const logger = mock_logger();

    const placeholder_service = (req, callback) => {
      t.deepEqual(req, { param1: 'param1 value' });

      const response = [
        {
          id: 123,
          name: 'name 1',
          placetype: 'neighbourhood',
          lineage: [
            {
              country: {
                id: 1,
                name: 'country name 1',
                abbr: 'country abbr 1'
              },
              region: {
                name: 'region name 2',
                abbr: 'region abbr 2'
              }
            }
          ],
          geom: {
            area: 12.34
          }
        }
      ];

      callback(null, response);
    };

    const controller = proxyquire('../../../controller/placeholder', {
      'pelias-logger': logger
    })(placeholder_service, true, () => true);

    const req = { param1: 'param1 value' };
    const res = { };

    controller(req, res, () => {
      const expected_res = {
        meta: {
          query_type: 'fallback'
        },
        data: [
          {
            _id: '123',
            _type: 'neighbourhood',
            layer: 'neighbourhood',
            source: 'whosonfirst',
            source_id: '123',
            name: {
              'default': 'name 1'
            },
            phrase: {
              'default': 'name 1'
            },
            parent: {
              country: ['country name 1'],
              country_id: ['1'],
              country_a: ['country abbr 1']
            }
          }
        ]
      };

      t.deepEquals(res, expected_res);
      t.end();
    });

  });

};

module.exports.tests.geometry_errors = (test, common) => {
  test('result without geometry should not cause problems', (t) => {
    const logger = mock_logger();

    const placeholder_service = (req, callback) => {
      t.deepEqual(req, { param1: 'param1 value' });

      const response = [
        {
          id: 123,
          name: 'name 1',
          placetype: 'neighbourhood'
        }
      ];

      callback(null, response);
    };

    const controller = proxyquire('../../../controller/placeholder', {
      'pelias-logger': logger
    })(placeholder_service, true, () => true);

    const req = { param1: 'param1 value' };
    const res = { };

    controller(req, res, () => {
      const expected_res = {
        meta: {
          query_type: 'fallback'
        },
        data: [
          {
            _id: '123',
            _type: 'neighbourhood',
            layer: 'neighbourhood',
            source: 'whosonfirst',
            source_id: '123',
            name: {
              'default': 'name 1'
            },
            phrase: {
              'default': 'name 1'
            }
          }
        ]
      };

      t.deepEquals(res, expected_res);
      t.end();
    });

  });

};

module.exports.tests.centroid_errors = (test, common) => {
  test('result without geom.lat/geom.lon should leave centroid undefined', (t) => {
    const logger = require('pelias-mock-logger')();

    const placeholder_service = (req, callback) => {
      t.deepEqual(req, { param1: 'param1 value' });

      const response = [
        {
          id: 123,
          name: 'name 1',
          placetype: 'neighbourhood',
          geom: {
            area: 12.34,
            bbox: '21.212121,12.121212,31.313131,13.131313'
          }
        }
      ];

      callback(null, response);
    };

    const controller = proxyquire('../../../controller/placeholder', {
      'pelias-logger': logger
    })(placeholder_service, true, () => true);

    const req = { param1: 'param1 value' };
    const res = { };

    controller(req, res, () => {
      const expected_res = {
        meta: {
          query_type: 'fallback'
        },
        data: [
          {
            _id: '123',
            _type: 'neighbourhood',
            layer: 'neighbourhood',
            source: 'whosonfirst',
            source_id: '123',
            bounding_box: '{"min_lat":12.121212,"max_lat":13.131313,"min_lon":21.212121,"max_lon":31.313131}',
            name: {
              'default': 'name 1'
            },
            phrase: {
              'default': 'name 1'
            }
          }
        ]
      };

      t.deepEquals(res, expected_res);
      t.ok(logger.isErrorMessage(`could not parse centroid for id 123`));
      t.end();
    });

  });

  test('result with non-number-parseable geom.lat/geom.lon should leave centroid undefined and log error', (t) => {
    const logger = mock_logger();

    const placeholder_service = (req, callback) => {
      t.deepEqual(req, { param1: 'param1 value' });

      const response = [
        {
          id: 123,
          name: 'name 1',
          placetype: 'neighbourhood',
          geom: {
            area: 12.34,
            bbox: '21.212121,12.121212,31.313131,13.131313',
            lat: 'this is not a number',
            lon: 'this is not a number'
          }
        }
      ];

      callback(null, response);
    };

    const controller = proxyquire('../../../controller/placeholder', {
      'pelias-logger': logger
    })(placeholder_service, true, () => true);

    const req = { param1: 'param1 value' };
    const res = { };

    controller(req, res, () => {
      const expected_res = {
        meta: {
          query_type: 'fallback'
        },
        data: [
          {
            _id: '123',
            _type: 'neighbourhood',
            layer: 'neighbourhood',
            source: 'whosonfirst',
            source_id: '123',
            bounding_box: '{"min_lat":12.121212,"max_lat":13.131313,"min_lon":21.212121,"max_lon":31.313131}',
            name: {
              'default': 'name 1'
            },
            phrase: {
              'default': 'name 1'
            }
          }
        ]
      };

      t.deepEquals(res, expected_res);
      t.ok(logger.isErrorMessage(`could not parse centroid for id 123`));
      t.end();
    });

  });

};

module.exports.tests.boundingbox_errors = (test, common) => {
  test('result with invalid geom.bbox should leave bounding_box undefined and log error', (t) => {
    [
      undefined,
      '21.212121,12.121212,31.313131,13.131313,41.414141',
      '21.212121,12.121212,31.313131',
      '21.212121,this is not parseable as a number,31.313131,13.131313',
      '21.212121,NaN,31.313131,13.131313',
      '21.212121,Infinity,31.313131,13.131313'
    ].forEach((bbox) => {
      const logger = mock_logger();

      const placeholder_service = (req, callback) => {
        const response = [
          {
            id: 123,
            name: 'name 1',
            placetype: 'neighbourhood',
            geom: {
              area: 12.34,
              bbox: bbox,
              lat: 14.141414,
              lon: 41.414141
            }
          }
        ];

        t.deepEqual(req, { param1: 'param1 value' });
        callback(null, response);
      };

      const controller = proxyquire('../../../controller/placeholder', {
        'pelias-logger': logger
      })(placeholder_service, true, () => true);

      const req = { param1: 'param1 value' };
      const res = { };

      controller(req, res, () => {
        const expected_res = {
          meta: {
            query_type: 'fallback'
          },
          data: [
            {
              _id: '123',
              _type: 'neighbourhood',
              layer: 'neighbourhood',
              source: 'whosonfirst',
              source_id: '123',
              center_point: {
                lat: 14.141414,
                lon: 41.414141
              },
              name: {
                'default': 'name 1'
              },
              phrase: {
                'default': 'name 1'
              }
            }
          ]
        };

        t.deepEquals(res, expected_res);
        t.ok(logger.isErrorMessage(`could not parse bbox for id 123: ${bbox}`));
      });

    });
    t.end();

  });

};

module.exports.tests.error_conditions = (test, common) => {
  test('service return error string should add to req.errors', (t) => {
    const logger = mock_logger();

    const placeholder_service = (req, callback) => {
      callback('placeholder service error', []);
    };

    const controller = proxyquire('../../../controller/placeholder', {
      'pelias-logger': logger
    })(placeholder_service, true, () => true);

    const req = {
      errors: []
    };
    const res = {};

    controller(req, res, () => {
      t.deepEquals(res, {}, 'res should not have been modified');
      t.deepEquals(req.errors, ['placeholder service error']);
      t.notOk(logger.isInfoMessage(/\\[controller:placeholder\\] \\[result_count:\\d+\\]/));
      t.end();
    });

  });

  test('service return error object should add message to req.errors', (t) => {
    const logger = mock_logger();

    const placeholder_service = (req, callback) => {
      callback(Error('placeholder service error'), []);
    };

    const should_execute = (req, res) => {
      return true;
    };

    const controller = proxyquire('../../../controller/placeholder', {
      'pelias-logger': logger
    })(placeholder_service, true, () => true);

    const req = {
      errors: []
    };
    const res = {};

    controller(req, res, () => {
      t.deepEquals(res, {}, 'res should not have been modified');
      t.deepEquals(req.errors, ['placeholder service error']);
      t.notOk(logger.isInfoMessage(/\\[controller:placeholder\\] \\[result_count:\\d+\\]/));
      t.end();
    });

  });

  test('service return error object should add stringified error to req.errors', (t) => {
    const logger = mock_logger();

    const placeholder_service = (req, callback) => {
      callback({ error_key: 'error_value' }, []);
    };

    const controller = proxyquire('../../../controller/placeholder', {
      'pelias-logger': logger
    })(placeholder_service, true, () => true);

    const req = {
      errors: []
    };
    const res = {};

    controller(req, res, () => {
      t.deepEquals(res, {}, 'res should not have been modified');
      t.deepEquals(req.errors, [{ error_key: 'error_value' }]);
      t.notOk(logger.isInfoMessage(/\\[controller:placeholder\\] \\[result_count:\\d+\\]/));
      t.end();
    });

  });

};

module.exports.all = (tape, common) => {

  function test(name, testFunction) {
    return tape(`GET /placeholder ${name}`, testFunction);
  }

  for( const testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
