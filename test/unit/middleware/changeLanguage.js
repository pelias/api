'use strict';

const setup = require('../../../middleware/changeLanguage');
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
    t.plan(2, 'should_execute will assert 2 things');

    const service = () => {
      t.fail('service should not have been called');
    };

    const should_execute = (req, res) => {
      t.deepEquals(req, { a: 1 });
      t.deepEquals(res, { b: 2 });
      return false;
    };

    const controller = setup(service, should_execute);

    controller({ a: 1 }, { b: 2 }, () => { });

  });

};

module.exports.tests.error_conditions = (test, common) => {
  test('service error should log and call next', t => {
    // (2) req/res were passed to service
    // (1) error was logged
    // (1) res was not modified
    t.plan(4);

    const service = (req, res, callback) => {
      t.deepEquals(req, { a: 1 } );
      t.deepEquals(res, { b: 2 } );
      callback('this is an error');
    };

    const logger = require('pelias-mock-logger')();

    const controller = proxyquire('../../../middleware/changeLanguage', {
      'pelias-logger': logger
    })(service, () => true);

    const req = { a: 1 };
    const res = { b: 2 };

    controller(req, res, () => {
      t.ok(logger.isErrorMessage('this is an error'));
      t.deepEquals(res, { b: 2 }, 'res should not have been modified');
    });

  });

};

module.exports.tests.success_conditions = (test, common) => {
  test('translations should be mapped in', t => {
    // (2) req/res were passed to service
    // (1) error was logged
    // (1) res was not modified
    // t.plan(4);

    const service = (req, res, callback) => {
      const response = {
        '1': {
          names: {
            'requested language': [
              'replacement name for layer1'
            ],
            // this should be ignored
            'another language': [
              'name in another language'
            ]
          }
        },
        '2': {
          names: {
            'requested language': [
              'replacement name for layer2',
              // this should be ignored
              'another replacement name for layer2'
            ]
          }
        },
        '3': {
          names: {
            'requested language': [
              'replacement name 1 for layer3'
            ]
          }
        },
        '4': {
          names: {
            'requested language': [
              'replacement name 2 for layer3'
            ]
          }
        },
        '10': {
          // has names but not in the requested language
          names: {
            'another language': [
              'replacement name for layer4'
            ]
          }
        },
        '11': {
          // no names
        }
      };

      callback(null, response);
    };

    const logger = require('pelias-mock-logger')();

    const controller = proxyquire('../../../middleware/changeLanguage', {
      'pelias-logger': logger
    })(service, () => true);

    const req = {
      clean: {
        lang: {
          iso6393: 'requested language'
        }
      }
    };

    const res = {
      data: [
        // doc with 2 layer names that will be changed
        {
          name: {
            default: 'original name for 1st result'
          },
          layer: 'layer1',
          parent: {
            layer1_id: ['1'],
            layer1: ['original name for layer1'],
            layer2_id: ['2'],
            layer2: ['original name for layer2']
          }
        },
        // not sure how this would sneak in but check anyway
        undefined,
        // doc w/o parent
        {},
        // doc with only 1 layer name that will be changed and no default name change
        {
          name: {
            default: 'original name for 2nd result'
          },
          layer: 'layer10',
          parent: {
            layer3_id: ['3', '4'],
            layer3: ['original name 1 for layer3', 'original name 2 for layer3'],
            // requested language not found for this id
            layer10_id: ['10'],
            layer10: ['original name for layer10'],
            // no names for this id
            layer11_id: ['11'],
            layer11: ['original name for layer11'],
            // no translations for this id
            layer12_id: ['12'],
            layer12: ['original name for layer12'],
            // undefined id, will be skipped
            layer13_id: [undefined],
            layer13: ['original name for layer13']
          }
        }
      ]
    };

    controller(req, res, () => {
      t.ok(logger.isDebugMessage('[language] [debug] missing translation requested language 10'));
      t.ok(logger.isDebugMessage('[language] [debug] missing translation requested language 11'));
      t.ok(logger.isDebugMessage('[language] [debug] failed to find translations for 12'));

      t.notOk(logger.hasErrorMessages(), 'there shouldn\'t be any error messages');

      t.deepEquals(res, {
        data: [
          {
            name: {
              default: 'replacement name for layer1'
            },
            layer: 'layer1',
            parent: {
              layer1_id: ['1'],
              layer1: ['replacement name for layer1'],
              layer2_id: ['2'],
              layer2: ['replacement name for layer2']
            }
          },
          undefined,
          {},
          {
            name: {
              default: 'original name for 2nd result'
            },
            layer: 'layer10',
            parent: {
              layer3_id: ['3', '4'],
              layer3: ['replacement name 1 for layer3', 'replacement name 2 for layer3'],
              layer10_id: ['10'],
              layer10: ['original name for layer10'],
              layer11_id: ['11'],
              layer11: ['original name for layer11'],
              layer12_id: ['12'],
              layer12: ['original name for layer12'],
              layer13_id: [undefined],
              layer13: ['original name for layer13']
            }
          }
        ]
      });

      t.end();

    });

  });

};

module.exports.all = (tape, common) => {

  function test(name, testFunction) {
    return tape(`GET /changeLanguage ${name}`, testFunction);
  }

  for( const testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
