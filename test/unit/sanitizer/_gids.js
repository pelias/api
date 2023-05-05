const gids = require('../../../sanitizer/_gids');
const sanitizer = gids();

module.exports.tests = {};

module.exports.tests.sanitize_boundary_gid = function(test, common) {
  test('raw w/o boundary should set boundary.gid undefined', function(t) {
    var raw = { };
    var clean = {};
    var errorsAndWarnings = sanitizer.sanitize(raw, clean);
    t.equals(clean['boundary.gid'], undefined, 'should be undefined');
    t.deepEquals(errorsAndWarnings, { errors: [], warnings: [] }, 'no warnings or errors');
    t.end();
  });

  test('boundary.gid explicitly undefined in raw should leave boundary.gid undefined', function(t) {
    var raw = { 'boundary.gid': undefined };
    var clean = {};
    var errorsAndWarnings = sanitizer.sanitize(raw, clean);
    t.equals(clean['boundary.gid'], undefined, 'should be undefined');
    t.deepEquals(errorsAndWarnings, { errors: [], warnings: [] }, 'no warnings or errors');
    t.end();
  });

  test('non-string boundary.gid should set boundary.gid to undefined and return warning', function(t) {
    var raw = { 'boundary.gid': ['this isn\'t a string primitive'] };
    var clean = {};
    var errorsAndWarnings = sanitizer.sanitize(raw, clean);
    t.equals(clean['boundary.gid'], undefined, 'should be undefined');
    t.deepEquals(errorsAndWarnings, { errors: ['boundary.gid is not a string'], warnings: [] }, 'non-string boundary_gid warning');
    t.end();
  });

  test('non-string boundary.gid in raw should set boundary.gid to undefined and return warning', function(t) {
    var raw = { 'boundary.gid': 123 };
    var clean = {};
    var errorsAndWarnings = sanitizer.sanitize(raw, clean);
    t.equals(clean['boundary.gid'], undefined, 'should be undefined');
    t.deepEquals(errorsAndWarnings, { errors: ['boundary.gid is not a string'], warnings: [] }, 'non-string boundary_gid error');
    t.end();
  });

  test('wrong format for boundary.gid in raw should set boundary.gid to undefined', function(t) {
    var raw = { 'boundary.gid': 'whosonfirst:123' };
    var clean = {};
    var errorsAndWarnings = sanitizer.sanitize(raw, clean);
    t.equals(clean['boundary.gid'], undefined, 'should be undefined');
    t.deepEquals(errorsAndWarnings, { errors: ['whosonfirst:123 does not follow source:layer:id format'], warnings: [] },
      'wrong format boundary_gid error');
    t.end();
  });

  test('missing element for boundary.gid in raw should set boundary.gid to undefined', function(t) {
    var raw = { 'boundary.gid': 'whosonfirst::123' };
    var clean = {};
    var errorsAndWarnings = sanitizer.sanitize(raw, clean);
    t.equals(clean['boundary.gid'], undefined, 'should be undefined');
    t.deepEquals(errorsAndWarnings, { errors: ['whosonfirst::123 does not follow source:layer:id format'], warnings: [] },
      'wrong format boundary_gid error');
    t.end();
  });

   test('wrong format for boundary.gid in raw should set boundary.gid to undefined', function(t) {
    var raw = { 'boundary.gid': 'whosonfirst:neighbourhood:123:a:b' };
    var clean = {};
    var errorsAndWarnings = sanitizer.sanitize(raw, clean);
    t.equals(clean['boundary.gid'], undefined, 'should be undefined');
    t.deepEquals(errorsAndWarnings, { errors: ['whosonfirst:neighbourhood:123:a:b does not follow source:layer:id format'], warnings: [] },
      'wrong format boundary_gid error');
    t.end();
  });

  test('correctly formatted boundary.gid in raw should set boundary.gid', function(t) {
    var raw = { 'boundary.gid': 'whosonfirst:locality:123' };
    var clean = {};
    var errorsAndWarnings = sanitizer.sanitize(raw, clean);
    t.equals(clean['boundary.gid'], '123', 'should be set correctly');
    t.deepEquals(errorsAndWarnings, { errors: [], warnings: [] }, 'valid boundary_gid is set');
    t.end();
  });

  test('correctly formatted OSM-style boundary.gid in raw should set boundary.gid', function(t) {
    var raw = { 'boundary.gid': 'openstreetmap:street:polyline:123' };
    var clean = {};
    var errorsAndWarnings = sanitizer.sanitize(raw, clean);
    t.equals(clean['boundary.gid'], 'polyline:123', 'should be set correctly');
    t.deepEquals(errorsAndWarnings, { errors: [], warnings: [] }, 'valid boundary_gid is set');
    t.end();
  });



  test('return an array of expected parameters in object form for validation', (t) => {
    const expected = [{ name: 'boundary.gid' }];
    const validParameters = sanitizer.expected();
    t.deepEquals(validParameters, expected);
    t.end();
  });

  test('return an array of expected custom parameters in object form for validation', (t) => {
    const expected = [{ name: 'custom-name.gid' }];
    const validParameters = gids('custom-name').expected();
    t.deepEquals(validParameters, expected);
    t.end();
  });

};

module.exports.all = function (tape, common) {
  function test(name, testFunction) {
    return tape('SANITIZE _boundary_gid ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
