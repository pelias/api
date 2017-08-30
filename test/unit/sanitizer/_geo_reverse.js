'use strict';

const sanitizer = require('../../../sanitizer/_geo_reverse')();
const defaults = require('../../../query/reverse_defaults');

module.exports.tests = {};

module.exports.tests.warning_situations = (test, common) => {
  test('raw with boundary.circle.lat should add warning about ignored boundary.circle', (t) => {
    const raw = {
      'point.lat': '12.121212',
      'point.lon': '21.212121',
      'boundary.circle.lat': '13.131313'
    };
    const clean = {};
    const errorsAndWarnings = sanitizer.sanitize(raw, clean);

    t.equals(clean['boundary.circle.lat'], 12.121212, 'should be set to point.lat');
    t.deepEquals(errorsAndWarnings, {
      errors: [],
      warnings: ['boundary.circle.lat/boundary.circle.lon are currently unsupported']
    }, 'no warnings/errors');
    t.end();

  });

  test('raw with boundary.circle.lon should add warning about ignored boundary.circle', (t) => {
    const raw = {
      'point.lat': '12.121212',
      'point.lon': '21.212121',
      'boundary.circle.lon': '31.313131'
    };
    const clean = {};
    const errorsAndWarnings = sanitizer.sanitize(raw, clean);

    t.equals(clean['boundary.circle.lon'], 21.212121, 'should be set to point.lon');
    t.deepEquals(errorsAndWarnings, {
      errors: [],
      warnings: ['boundary.circle.lat/boundary.circle.lon are currently unsupported']
    }, 'no warnings/errors');
    t.end();

  });

  test('raw with boundary.circle.radius shouldn\'t add warning about ignored boundary.circle', (t) => {
    const raw = {
      'point.lat': '12.121212',
      'point.lon': '21.212121',
      'boundary.circle.radius': '17'
    };
    const clean = {};
    const errorsAndWarnings = sanitizer.sanitize(raw, clean);

    // t.equals(clean['boundary.circle.radius'], 12.121212, 'should be set to point.lat')
    t.deepEquals(errorsAndWarnings, {
      errors: [],
      warnings: []
    }, 'no warnings/errors');
    t.end();

  });

};

module.exports.tests.success_conditions = (test, common) => {
  test('boundary.circle.radius specified in request should override default', (t) => {
    const raw = {
      'point.lat': '12.121212',
      'point.lon': '21.212121',
      'boundary.circle.radius': '3248732857km' // this will never be the default
    };
    const clean = {};
    const errorsAndWarnings = sanitizer.sanitize(raw, clean);

    t.equals(raw['boundary.circle.lat'], 12.121212);
    t.equals(raw['boundary.circle.lon'], 21.212121);
    t.equals(raw['boundary.circle.radius'], '3248732857km');
    t.equals(clean['boundary.circle.lat'], 12.121212);
    t.equals(clean['boundary.circle.lon'], 21.212121);
    t.equals(clean['boundary.circle.radius'], 3248732857.0);

    t.deepEquals(errorsAndWarnings, { errors: [], warnings: [] });
    t.end();

  });

};

module.exports.all = (tape, common) => {
  function test(name, testFunction) {
    return tape(`SANITIZE _geo_reverse ${name}`, testFunction);
  }

  for( const testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
