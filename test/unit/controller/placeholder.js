'use strict';

const placeholder = require('../../../controller/placeholder');
const proxyquire =  require('proxyquire').noCallThru();

module.exports.tests = {};

module.exports.tests.interface = (test, common) => {
  test('valid interface', (t) => {
    t.equal(typeof placeholder, 'function', 'placeholder is a function');
    t.equal(typeof placeholder(), 'function', 'placeholder returns a controller');
    t.end();
  });
};

module.exports.tests.should_execute_failure = (test, common) => {
  test('should_execute returning false should return without calling service', (t) => {
    let placeholderService_was_called = false;

    const placeholderService = () => {
      placeholderService_was_called = true;
    };

    const should_execute = (req, res) => {
      // req and res should be passed to should_execute
      t.deepEquals(req, { a: 1 });
      t.deepEquals(res, { b: 2 });
      return false;
    };

    const controller = placeholder(placeholderService, should_execute);

    const req = { a: 1 };
    const res = { b: 2 };

    controller(req, res, () => {
      t.notOk(placeholderService_was_called);
      t.end();
    });

  });

};

module.exports.tests.success = (test, common) => {
  test('should_execute returning true should call service', (t) => {
    let placeholderService_was_called = false;

    const placeholderService = (req, callback) => {
      t.deepEqual(req, { param1: 'param1 value' });
      placeholderService_was_called = true;
      callback(null, []);
    };

    const should_execute = (req, res) => {
      return true;
    };

    const controller = placeholder(placeholderService, should_execute);

    const req = { param1: 'param1 value' };
    const res = { b: 2 };

    controller(req, res, () => {
      t.ok(placeholderService_was_called);
      t.end();
    });

  });

  test('response from service should be converted', (t) => {
    let placeholderService_was_called = false;

    const placeholder_response = [
      {
        id: 123,
        name: 'name 1',
        placetype: 'neighbourhood',
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
        lineage: [ {} ],
        geom: {
          area: 23.45,
          bbox: '51.515151,15.151515,61.616161,16.161616',
          lat: 17.171717,
          lon: 71.717171
        }
      }
    ];

    const placeholderService = (req, callback) => {
      t.deepEqual(req, { param1: 'param1 value' });
      placeholderService_was_called = true;
      callback(null, placeholder_response);
    };

    const should_execute = (req, res) => {
      return true;
    };

    const controller = placeholder(placeholderService, should_execute);

    const req = { param1: 'param1 value' };
    const res = { };

    const expected_res = {
      meta: {},
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
          alpha3: 'ABC',
          parent: {
            neighbourhood: ['neighbourhood name 1'],
            neighbourhood_id: ['10'],
            neighbourhood_a: [null],
            borough: ['borough name 1'],
            borough_id: ['9'],
            borough_a: [null],
            locality: ['locality name 1'],
            locality_id: ['8'],
            locality_a: [null],
            localadmin: ['localadmin name 1'],
            localadmin_id: ['7'],
            localadmin_a: [null],
            county: ['county name 1'],
            county_id: ['6'],
            county_a: [null],
            macrocounty: ['macrocounty name 1'],
            macrocounty_id: ['5'],
            macrocounty_a: [null],
            region: ['region name 1'],
            region_id: ['4'],
            region_a: [null],
            macroregion: ['macroregion name 1'],
            macroregion_id: ['3'],
            macroregion_a: [null],
            dependency: ['dependency name 1'],
            dependency_id: ['2'],
            dependency_a: [null],
            country: ['country name 1'],
            country_id: ['1'],
            country_a: ['ABC']
          }
        },
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
          alpha3: 'XYZ',
          parent: {
            neighbourhood: ['neighbourhood name 2'],
            neighbourhood_id: ['20'],
            neighbourhood_a: ['neighbourhood abbr 2'],
            borough: ['borough name 2'],
            borough_id: ['19'],
            borough_a: ['borough abbr 2'],
            locality: ['locality name 2'],
            locality_id: ['18'],
            locality_a: ['locality abbr 2'],
            localadmin: ['localadmin name 2'],
            localadmin_id: ['17'],
            localadmin_a: ['localadmin abbr 2'],
            county: ['county name 2'],
            county_id: ['16'],
            county_a: ['county abbr 2'],
            macrocounty: ['macrocounty name 2'],
            macrocounty_id: ['15'],
            macrocounty_a: ['macrocounty abbr 2'],
            region: ['region name 2'],
            region_id: ['14'],
            region_a: ['region abbr 2'],
            macroregion: ['macroregion name 2'],
            macroregion_id: ['13'],
            macroregion_a: ['macroregion abbr 2'],
            dependency: ['dependency name 2'],
            dependency_id: ['12'],
            dependency_a: ['dependency abbr 2'],
            country: ['country name 2'],
            country_id: ['11'],
            country_a: ['XYZ']
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
          parent: { }
        }
      ]
    };

    controller(req, res, () => {
      t.ok(placeholderService_was_called);
      t.deepEquals(res, expected_res);
      t.end();
    });

  });

  test('results with no lineage should no set any parent fields', (t) => {
    const placeholder_response = [
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

    const placeholderService = (req, callback) => {
      t.deepEqual(req, { param1: 'param1 value' });
      callback(null, placeholder_response);
    };

    const should_execute = (req, res) => {
      return true;
    };

    const controller = placeholder(placeholderService, should_execute);

    const req = { param1: 'param1 value' };
    const res = { };

    const expected_res = {
      meta: {},
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
          parent: { }
        }
      ]
    };

    controller(req, res, () => {
      t.deepEquals(res, expected_res);
      t.end();
    });

  });

  test('results with string geom.lat/geom.lon should convert to numbers', (t) => {
    const placeholder_response = [
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

    const placeholderService = (req, callback) => {
      t.deepEqual(req, { param1: 'param1 value' });
      callback(null, placeholder_response);
    };

    const should_execute = (req, res) => {
      return true;
    };

    const controller = placeholder(placeholderService, should_execute);

    const req = { param1: 'param1 value' };
    const res = { };

    const expected_res = {
      meta: {},
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
          },
          parent: { }
        }
      ]
    };

    controller(req, res, () => {
      t.deepEquals(res, expected_res);
      t.end();
    });

  });

  test('result without geom.bbox should leave bounding_box undefined', (t) => {
    const placeholder_response = [
      {
        id: 123,
        name: 'name 1',
        placetype: 'neighbourhood',
        geom: {
          area: 12.34,
          lat: 14.141414,
          lon: 41.414141
        }
      }
    ];

    const placeholderService = (req, callback) => {
      t.deepEqual(req, { param1: 'param1 value' });
      callback(null, placeholder_response);
    };

    const should_execute = (req, res) => {
      return true;
    };

    const controller = placeholder(placeholderService, should_execute);

    const req = { param1: 'param1 value' };
    const res = { };

    const expected_res = {
      meta: {},
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
          },
          parent: { }
        }
      ]
    };

    controller(req, res, () => {
      t.deepEquals(res, expected_res);
      t.end();
    });

  });

  test('result without geom.lat/geom.lon should leave centroid undefined', (t) => {
    const placeholder_response = [
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

    const placeholderService = (req, callback) => {
      t.deepEqual(req, { param1: 'param1 value' });
      callback(null, placeholder_response);
    };

    const should_execute = (req, res) => {
      return true;
    };

    const controller = placeholder(placeholderService, should_execute);

    const req = { param1: 'param1 value' };
    const res = { };

    const expected_res = {
      meta: {},
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
          },
          parent: { }
        }
      ]
    };

    controller(req, res, () => {
      t.deepEquals(res, expected_res);
      t.end();
    });

  });

  test('only results matching explicit layers should be returned', (t) => {
    let placeholderService_was_called = false;

    const placeholder_response = [
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

    const placeholderService = (req, callback) => {
      t.deepEqual(req, {
        param1: 'param1 value',
        clean: {
          layers: ['neighbourhood', 'locality', 'county']
        }
      });
      placeholderService_was_called = true;
      callback(null, placeholder_response);
    };

    const should_execute = (req, res) => {
      return true;
    };

    const controller = placeholder(placeholderService, should_execute);

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

    const expected_res = {
      meta: {},
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
          },
          parent: { }
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
          },
          parent: { }
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
          },
          parent: { }
        }
      ]
    };

    controller(req, res, () => {
      t.ok(placeholderService_was_called);
      t.deepEquals(res, expected_res);
      t.end();
    });

  });

  test('only synthesized docs matching explicit boundary.country should be returned', (t) => {
    let placeholderService_was_called = false;

    const placeholder_response = [
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

    const placeholderService = (req, callback) => {
      t.deepEqual(req, {
        param1: 'param1 value',
        clean: {
          'boundary.country': 'ABC'
        }
      });
      placeholderService_was_called = true;
      callback(null, placeholder_response);
    };

    const should_execute = (req, res) => {
      return true;
    };

    const controller = placeholder(placeholderService, should_execute);

    const req = {
      param1: 'param1 value',
      clean: {
        'boundary.country': 'ABC'
      }
    };
    const res = { };

    const expected_res = {
      meta: {},
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
          alpha3: 'ABC',
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
          alpha3: 'ABC',
          parent: {
            country: ['country name 4'],
            country_id: ['4'],
            country_a: ['ABC']
          }
        }
      ]
    };

    controller(req, res, () => {
      t.ok(placeholderService_was_called);
      t.deepEquals(res, expected_res);
      t.end();
    });

  });

};

module.exports.tests.error_conditions = (test, common) => {
  test('service return error string should add to req.errors', (t) => {
    const placeholderService = (req, callback) => {
      callback('placeholder service error', []);
    };

    const should_execute = (req, res) => {
      return true;
    };

    const controller = placeholder(placeholderService, should_execute);

    const req = {
      errors: []
    };
    const res = {};

    controller(req, res, () => {
      t.deepEquals(req.errors, ['placeholder service error']);
      t.end();
    });

  });

  test('service return error object should add message to req.errors', (t) => {
    const placeholderService = (req, callback) => {
      callback(Error('placeholder service error'), []);
    };

    const should_execute = (req, res) => {
      return true;
    };

    const controller = placeholder(placeholderService, should_execute);

    const req = {
      errors: []
    };
    const res = {};

    controller(req, res, () => {
      t.deepEquals(req.errors, ['placeholder service error']);
      t.end();
    });

  });

  test('service return error object should add stringified error to req.errors', (t) => {
    const placeholderService = (req, callback) => {
      callback({ error_key: 'error_value' }, []);
    };

    const should_execute = (req, res) => {
      return true;
    };

    const controller = placeholder(placeholderService, should_execute);

    const req = {
      errors: []
    };
    const res = {};

    controller(req, res, () => {
      t.deepEquals(req.errors, [{ error_key: 'error_value' }]);
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
