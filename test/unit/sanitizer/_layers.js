var type_mapping = require('../../../helper/type_mapping');

var sanitizer = require('../../../sanitizer/_targets')(
  'layers',
  type_mapping.layer_mapping,
);

module.exports.tests = {};

module.exports.tests.sanitize_layers = function (test, common) {
  test('unspecified', function (t) {
    var messages = sanitizer.sanitize({ layers: undefined }, {});
    t.equal(messages.errors.length, 0, 'no errors');
    t.end();
  });

  test('invalid layer', function (t) {
    var raw = { layers: 'test_layer' };
    var clean = {};

    var messages = sanitizer.sanitize(raw, clean);

    var msg = ' is an invalid layers parameter. Valid options: ';
    t.equal(messages.errors.length, 1, 'errors set');
    t.true(messages.errors[0].match(msg), 'invalid layer requested');
    t.true(messages.errors[0].length > msg.length, 'invalid error message');
    t.end();
  });

  test('invalid negative layer', function (t) {
    const raw = { layers: '-test_layer' };
    const clean = {};

    var messages = sanitizer.sanitize(raw, clean);

    const msg = ' is an invalid layers parameter. Valid options: ';
    t.equal(messages.errors.length, 1, 'errors set');
    t.true(messages.errors[0].match(msg), 'invalid layer message emitted');
    t.true(
      messages.errors[0].match('test_layer'),
      'invalid layer message contains layer',
    );
    t.end();
  });

  test('venue (alias) layer', function (t) {
    var raw = { layers: 'venue' };
    var clean = {};

    sanitizer.sanitize(raw, clean);

    var venue_layers = ['venue'];
    t.deepEqual(clean.layers, venue_layers, 'venue layers set');
    t.end();
  });

  test('coarse (alias) layer', function (t) {
    var raw = { layers: 'coarse' };
    var clean = {};

    sanitizer.sanitize(raw, clean);

    var admin_layers = [
      'continent',
      'empire',
      'country',
      'dependency',
      'macroregion',
      'region',
      'locality',
      'localadmin',
      'macrocounty',
      'county',
      'macrohood',
      'borough',
      'neighbourhood',
      'microhood',
      'disputed',
      'postalcode',
      'ocean',
      'marinearea',
    ];

    t.deepEqual(clean.layers, admin_layers, 'coarse layers set');
    t.end();
  });

  test('address layer', function (t) {
    var raw = { layers: 'address' };
    var clean = {};

    sanitizer.sanitize(raw, clean);

    t.deepEqual(clean.layers, ['address'], 'address layer set');
    t.end();
  });

  test('venue alias layer plus regular layers', function (t) {
    var raw = { layers: 'venue,country,region' };
    var clean = {};

    sanitizer.sanitize(raw, clean);

    var expected_layers = ['venue', 'country', 'region'];
    t.deepEqual(clean.layers, expected_layers, 'venue + regular layers');
    t.end();
  });

  test('coarse alias layer plus regular layers', function (t) {
    var raw = { layers: 'coarse,country' };
    var clean = {};

    sanitizer.sanitize(raw, clean);

    var expected_layers = [
      'continent',
      'empire',
      'country',
      'dependency',
      'macroregion',
      'region',
      'locality',
      'localadmin',
      'macrocounty',
      'county',
      'macrohood',
      'borough',
      'neighbourhood',
      'microhood',
      'disputed',
      'postalcode',
      'ocean',
      'marinearea',
    ];

    t.deepEqual(clean.layers, expected_layers, 'coarse + regular layers set');
    t.end();
  });

  test('address alias layer plus regular layers', function (t) {
    var raw = { layers: 'address,country,locality' };
    var clean = {};

    sanitizer.sanitize(raw, clean);

    var expected_layers = ['address', 'country', 'locality'];
    t.deepEqual(clean.layers, expected_layers, 'address + regular layers set');
    t.end();
  });

  test('alias layer plus regular layers (no duplicates)', function (t) {
    var raw = { layers: 'venue,country' };
    var clean = {};

    sanitizer.sanitize(raw, clean);

    var expected_layers = ['venue', 'country'];
    t.deepEqual(
      clean.layers,
      expected_layers,
      'venue layers found (no duplicates)',
    );
    t.end();
  });

  test('multiple alias layers (no duplicates)', function (t) {
    var raw = { layers: 'venue,coarse' };
    var clean = {};

    sanitizer.sanitize(raw, clean);

    var coarse_layers = [
      'continent',
      'empire',
      'country',
      'dependency',
      'macroregion',
      'region',
      'locality',
      'localadmin',
      'macrocounty',
      'county',
      'macrohood',
      'borough',
      'neighbourhood',
      'microhood',
      'disputed',
      'postalcode',
      'ocean',
      'marinearea',
    ];

    var venue_layers = ['venue'];
    var expected_layers = venue_layers.concat(coarse_layers);
    t.deepEqual(
      clean.layers,
      expected_layers,
      'all layers found (no duplicates)',
    );
    t.end();
  });

  test('positive and negative layers', function (t) {
    var raw = { layers: 'venue,address,-venue' };
    var clean = {};

    sanitizer.sanitize(raw, clean);

    var expected_layers = ['address'];
    t.deepEqual(
      clean.layers,
      expected_layers,
      'positive layers plus negative layer returns only selected positive layers',
    );
    t.end();
  });

  test('only negative layers', function (t) {
    var raw = { layers: '-venue' };
    var clean = {};

    sanitizer.sanitize(raw, clean);

    const expected_layers = type_mapping
      .getCanonicalLayers()
      .filter((layer) => layer !== 'venue')
      .sort();

    t.deepEqual(
      clean.layers.sort(),
      expected_layers,
      'all layers except negative layer selected',
    );
    t.end();
  });

  test('only negative layers, duplicated', function (t) {
    var raw = { layers: '-venue,-venue' };
    var clean = {};

    sanitizer.sanitize(raw, clean);

    const expected_layers = type_mapping
      .getCanonicalLayers()
      .filter((layer) => layer !== 'venue')
      .sort();

    t.deepEqual(
      clean.layers.sort(),
      expected_layers,
      'all layers except negative layer selected',
    );
    t.end();
  });

  test('only negative layers, with extra space character', function (t) {
    var raw = { layers: '- venue' };
    var clean = {};

    sanitizer.sanitize(raw, clean);

    const expected_layers = type_mapping
      .getCanonicalLayers()
      .filter((layer) => layer !== 'venue')
      .sort();

    t.deepEqual(
      clean.layers.sort(),
      expected_layers,
      'all layers except negative layer selected',
    );
    t.end();
  });

  test('only negative layers, with extra unicode whitespace character', function (t) {
    var raw = { layers: '-\uFEFFvenue' };
    var clean = {};

    sanitizer.sanitize(raw, clean);

    const expected_layers = type_mapping
      .getCanonicalLayers()
      .filter((layer) => layer !== 'venue')
      .sort();

    t.deepEqual(
      clean.layers.sort(),
      expected_layers,
      'all layers except negative layer selected',
    );
    t.end();
  });

  test('positive alias and negative layers', function (t) {
    var raw = { layers: 'coarse,-locality' };
    var clean = {};

    sanitizer.sanitize(raw, clean);

    // final list of layers should be all coarse layers, except locality
    const expected_layers = type_mapping.layer_mapping.coarse.filter(
      (layer) => layer !== 'locality',
    );

    t.deepEqual(
      clean.layers,
      expected_layers,
      'positive alias plus negative layer returns subset of alias',
    );
    t.deepEqual(
      clean.negative_layers,
      ['locality'],
      'negative_layers value is set',
    );
    t.end();
  });

  test('negative alias and positive layer in that alias', function (t) {
    var raw = { layers: '-coarse,locality' };
    var clean = {};

    const messages = sanitizer.sanitize(raw, clean);

    // final list of layers should be all coarse layers, except locality
    t.deepEqual(
      clean.layers,
      undefined,
      'returns undefined, as negative layers are applied after',
    );
    t.equal(messages.errors.length, 1, 'error emitted: invalid combination');
    t.end();
  });

  test('positive alias and negative layers, reverse order', function (t) {
    var raw = { layers: '-locality,coarse' };
    var clean = {};

    sanitizer.sanitize(raw, clean);

    // final list of layers should be all coarse layers, except locality
    const expected_layers = type_mapping.layer_mapping.coarse.filter(
      (layer) => layer !== 'locality',
    );

    t.deepEqual(
      clean.layers,
      expected_layers,
      'positive alias plus negative layer returns subset of alias',
    );
    t.end();
  });
};

module.exports.all = function (tape, common) {
  function test(name, testFunction) {
    return tape('SANITIZE _layers ' + name, testFunction);
  }

  for (var testCase in module.exports.tests) {
    module.exports.tests[testCase](test, common);
  }
};
