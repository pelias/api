'use strict';

const _ = require('lodash');
const has_request_focus_point = require('../../../../controller/predicates/has_request_focus_point');

module.exports.tests = {};

module.exports.tests.interface = (test, common) => {
  test('valid interface', t => {
    t.equal(typeof has_request_focus_point, 'function', 'has_request_focus_point is a function');
    t.end();
  });
};

module.exports.tests.true_conditions = (test, common) => {
  test('request.clean with focus.point.lat and focus.point.lon should return true', t => {
    const req = {
      clean: {
        'focus.point.lat': 12.121212,
        'focus.point.lon': 21.212121
      }
    };

    t.ok(has_request_focus_point(req));
    t.end();

  });

};

module.exports.tests.false_conditions = (test, common) => {
  test('undefined req should return false', t => {
    t.notOk(has_request_focus_point());
    t.end();

  });

  test('undefined req.clean should return false', t => {
    const req = {};

    t.notOk(has_request_focus_point(req));
    t.end();

  });

  test('undefined req.clean.\'focus.point.lat\' and req.clean.\'focus.point.lon\' should return false', t => {
    const req = {
      clean: {}
    };

    t.notOk(has_request_focus_point(req));
    t.end();

  });

  test('undefined req.clean.\'focus.point.lat\' and defined req.clean.\'focus.point.lon\' should return false', t => {
    const req = {
      clean: {
        'focus.point.lon': 21.212121
      }
    };

    t.notOk(has_request_focus_point(req));
    t.end();

  });

  test('defined req.clean.\'focus.point.lat\' and undefined req.clean.\'focus.point.lon\' should return false', t => {
    const req = {
      clean: {
        'focus.point.lat': 12.121212
      }
    };

    t.notOk(has_request_focus_point(req));
    t.end();

  });

};

module.exports.all = (tape, common) => {
  function test(name, testFunction) {
    return tape(`GET /has_request_focus_point ${name}`, testFunction);
  }

  for( const testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
