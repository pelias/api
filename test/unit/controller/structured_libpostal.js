'use strict';

const proxyquire =  require('proxyquire').noCallThru();
const libpostal = require('../../../controller/structured_libpostal');
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

// module.exports.tests.failure_conditions = (test, common) => {
//   test('service returning 2 or more of a label should return undefined and log message', t => {
//     const logger = mock_logger();
//
//     const service = (req, callback) => {
//       const response = [
//         {
//           label: 'road',
//           value: 'road value 1'
//         },
//         {
//           label: 'city',
//           value: 'city value'
//         },
//         {
//           label: 'road',
//           value: 'road value 2'
//         }
//       ];
//
//       callback(null, response);
//     };
//
//     const controller = proxyquire('../../../controller/libpostal', {
//       'pelias-logger': logger
//     })(service, () => true);
//
//     const req = {
//       clean: {
//         text: 'query value'
//       },
//       errors: []
//     };
//
//     controller(req, undefined, () => {
//       t.ok(logger.isWarnMessage('discarding libpostal parse of \'query value\' due to duplicate field assignments'));
//
//       t.deepEquals(req, {
//         clean: {
//           text: 'query value'
//         },
//         errors: []
//       }, 'req should not have been modified');
//
//       t.end();
//
//     });
//
//   });
//
//   test('service returning empty array should not set parsed_text or parser', t => {
//     const logger = mock_logger();
//
//     const service = (req, callback) => {
//       callback(null, []);
//     };
//
//     const controller = proxyquire('../../../controller/libpostal', {
//       'pelias-logger': logger
//     })(service, () => true);
//
//     const req = {
//       clean: {
//         text: 'query value'
//       },
//       errors: []
//     };
//
//     controller(req, undefined, () => {
//       t.deepEquals(req, {
//         clean: {
//           text: 'query value'
//         },
//         errors: []
//       }, 'req should not have been modified');
//
//       t.end();
//
//     });
//
//   });
//
// };
//
module.exports.tests.success_conditions = (test, common) => {
  test('service returning house_number should set req.clean.parsed_text.', t => {
    const service = (req, callback) => {
      const response = [
        {
          label: 'house_number',
          value: 'house_number value'
        },
        {
          label: 'postcode',
          value: 'postcode value'
        }
      ];

      callback(null, response);
    };

    const controller = libpostal(service, () => true);

    const req = {
      clean: {
        parsed_text: {
          address: 'other value house_number value street value'
        }
      },
      errors: []
    };

    controller(req, undefined, () => {
      t.deepEquals(req, {
        clean: {
          parsed_text: {
            number: 'house_number value',
            street: 'other value  street value'
          }
        },
        errors: []
      }, 'req should not have been modified');

      t.end();

    });

  });

  test('service returning postcode should set req.clean.parsed_text.', t => {
    const service = (req, callback) => {
      const response = [
        {
          label: 'postcode',
          value: 'postcode value'
        }
      ];

      callback(null, response);
    };

    const controller = libpostal(service, () => true);

    const req = {
      clean: {
        parsed_text: {
          address: 'other value postcode value street value'
        }
      },
      errors: []
    };

    controller(req, undefined, () => {
      t.deepEquals(req, {
        clean: {
          parsed_text: {
            number: 'postcode value',
            street: 'other value  street value'
          }
        },
        errors: []
      }, 'req should not have been modified');

      t.end();

    });

  });

  test('service returning neither house_number nor postcode should not set req.clean.parsed_text.number', t => {
    const service = (req, callback) => {
      const response = [
        {
          label: 'city',
          value: 'city value'
        }
      ];

      callback(null, response);
    };

    const controller = libpostal(service, () => true);

    const req = {
      clean: {
        parsed_text: {
          address: 'street value'
        }
      },
      errors: []
    };

    controller(req, undefined, () => {
      t.deepEquals(req, {
        clean: {
          parsed_text: {
            street: 'street value'
          }
        },
        errors: []
      }, 'req should not have been modified');

      t.end();

    });

  });

  // test('service returning valid response should convert and append', t => {
  //   const service = (req, callback) => {
  //     const response = [
  //       {
  //         label: 'island',
  //         value: 'island value'
  //       },
  //       {
  //         label: 'category',
  //         value: 'category value'
  //       },
  //       {
  //         label: 'house',
  //         value: 'house value'
  //       },
  //       {
  //         label: 'house_number',
  //         value: 'house_number value'
  //       },
  //       {
  //         label: 'road',
  //         value: 'road value'
  //       },
  //       {
  //         label: 'suburb',
  //         value: 'suburb value'
  //       },
  //       {
  //         label: 'city_district',
  //         value: 'city_district value'
  //       },
  //       {
  //         label: 'city',
  //         value: 'city value'
  //       },
  //       {
  //         label: 'state_district',
  //         value: 'state_district value'
  //       },
  //       {
  //         label: 'state',
  //         value: 'state value'
  //       },
  //       {
  //         label: 'postcode',
  //         value: 'postcode value'
  //       },
  //       {
  //         label: 'country',
  //         value: 'country value'
  //       }
  //     ];
  //
  //     callback(null, response);
  //   };
  //
  //   const controller = libpostal(service, () => true);
  //
  //   const req = {
  //     clean: {
  //       text: 'original query'
  //     },
  //     errors: []
  //   };
  //
  //   controller(req, undefined, () => {
  //     t.deepEquals(req, {
  //       clean: {
  //         text: 'original query',
  //         parser: 'libpostal',
  //         parsed_text: {
  //           island: 'island value',
  //           category: 'category value',
  //           query: 'house value',
  //           number: 'house_number value',
  //           street: 'road value',
  //           neighbourhood: 'suburb value',
  //           borough: 'city_district value',
  //           city: 'city value',
  //           county: 'state_district value',
  //           state: 'state value',
  //           postalcode: 'postcode value',
  //           country: 'country value'
  //         }
  //       },
  //       errors: []
  //     }, 'req should not have been modified');
  //
  //     t.end();
  //
  //   });
  //
  // });
  //
  // test('ISO-2 country should be converted to ISO-3', t => {
  //   const service = (req, callback) => {
  //     const response = [
  //       {
  //         label: 'country',
  //         value: 'ca'
  //       }
  //     ];
  //
  //     callback(null, response);
  //   };
  //
  //   const controller = libpostal(service, () => true);
  //
  //   const req = {
  //     clean: {
  //       text: 'original query'
  //     },
  //     errors: []
  //   };
  //
  //   controller(req, undefined, () => {
  //     t.deepEquals(req, {
  //       clean: {
  //         text: 'original query',
  //         parser: 'libpostal',
  //         parsed_text: {
  //           country: 'CAN'
  //         }
  //       },
  //       errors: []
  //     }, 'req should not have been modified');
  //
  //     t.end();
  //
  //   });
  //
  // });
  //
};

module.exports.all = (tape, common) => {

  function test(name, testFunction) {
    return tape(`GET /libpostal ${name}`, testFunction);
  }

  for( const testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
