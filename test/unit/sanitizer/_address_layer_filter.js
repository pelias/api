const sanitizer = require('../../../sanitizer/_address_layer_filter');
const TypeMapping = require('../../../helper/TypeMapping');
const NO_MESSAGES = { errors: [], warnings: [] };
const STD_MESSAGES = { errors: [], warnings: ['performance optimization: excluding \'address\' layer'] };

module.exports.tests = {};

module.exports.tests.sanitize = function (test, common) {
  // a simplified type mapping with dummy values
  let tm = new TypeMapping();
  tm.setLayersBySource({ A: ['A'], B: ['B'], C: ['C'] });
  tm.generateMappings();
  let s = sanitizer(tm);

  // a real type mapping with our common sources and layers
  const real_type_mapping = new TypeMapping();
  real_type_mapping.load();
  const real_sanitizer = sanitizer(real_type_mapping);


  test('sanitize - do nothing if clean.layers already specified', (t) => {
    let clean = { text: '1 example', layers: ['not empty'], positive_layers: ['not empty'] };
    t.deepEqual(s.sanitize(null, clean), NO_MESSAGES);
    t.deepEqual(clean.layers, ['not empty']);
    t.end();
  });

  test('sanitize - do nothing if clean.text is undefined', (t) => {
    let clean = {};
    t.deepEqual(s.sanitize(null, clean), NO_MESSAGES);
    t.false(clean.layers);
    t.end();
  });

  test('sanitize - do nothing if clean.text is empty', (t) => {
    let clean = { text: '' };
    t.deepEqual(s.sanitize(null, clean), NO_MESSAGES);
    t.false(clean.layers);
    t.end();
  });

  test('sanitize - do nothing for numeric multi-word inputs', (t) => {
    let clean = { text: '2 b' };
    t.deepEqual(s.sanitize(null, clean), NO_MESSAGES);
    t.false(clean.layers);
    t.end();
  });

  test('sanitize - apply layer filter for non-numeric multi-word inputs', (t) => {
    let clean = { text: 'foo bar baz bing' };
    t.deepEqual(s.sanitize(null, clean), STD_MESSAGES);
    t.deepEqual(clean.layers, ['A', 'B', 'C']);
    t.end();
  });

  test('sanitize - apply layer filter for single word inputs', (t) => {
    let clean = { text: 'foo' };
    t.deepEqual(s.sanitize(null, clean), STD_MESSAGES);
    t.deepEqual(clean.layers, ['A', 'B', 'C']);
    t.end();
  });

  test('sanitize - apply layer filter when clean.sources empty', (t) => {
    let clean = { text: 'foo', sources: [] };
    t.deepEqual(s.sanitize(null, clean), STD_MESSAGES);
    t.deepEqual(clean.layers, ['A', 'B', 'C']);
    t.end();
  });

  test('sanitize - reduce target layers when clean.sources specified', (t) => {
    let tm = new TypeMapping();
    tm.setLayersBySource({ A: ['A', 'address'], B: ['B', 'address'], C: ['C'] });
    tm.generateMappings();
    let s = sanitizer(tm);

    let clean = { text: 'foo', sources: [ 'A', 'C' ] };
    t.deepEqual(s.sanitize(null, clean), STD_MESSAGES);
    t.deepEqual(clean.layers, ['A', 'C']);
    t.end();
  });

  test('sanitize - do nothing for sources which do not have any addresses', (t) => {
    let tm = new TypeMapping();
    tm.setLayersBySource({ A: ['address'], B: ['address'] });
    tm.generateMappings();
    let s = sanitizer(tm);

    let clean = { text: 'foo', sources: ['A', 'B'] };
    t.deepEqual(s.sanitize(null, clean), NO_MESSAGES);
    t.false(clean.layers);
    t.end();
  });

  test('sanitize - do nothing when address layer explicitly specified', (t) => {
    let clean = { text: 'foo', layers: ['address', 'venue'], positive_layers: ['address', 'venue'] };

    t.deepEqual(real_sanitizer.sanitize(null, clean), NO_MESSAGES);
    t.deepEqual(clean.layers, ['address', 'venue']);
    t.end();
  });

  test('sanitize - do nothing when source with only addresses (OA) specified', (t) => {
    let clean = { text: 'foo', sources: ['openaddresses']};

    t.deepEqual(real_sanitizer.sanitize(null, clean), NO_MESSAGES);
    t.equal(clean.layers, undefined);
    t.deepEqual(clean.sources, ['openaddresses']);
    t.end();
  });

  test('sanitize - exclude layers when source with addresses and other layers (OSM) specified', (t) => {
    let clean = { text: 'foo', sources: ['openstreetmap']};

    t.deepEqual(real_sanitizer.sanitize(null, clean), STD_MESSAGES);
    t.deepEqual(clean.layers, ['venue', 'street'], 'layer list is reduced to exclude addresses');
    t.deepEqual(clean.sources, ['openstreetmap']);
    t.end();
  });

  test('sanitize - exclude addresses when negative layers other than address are specified', (t) => {
    // select all layers except venue to simulate value of clean.layers from targets sanitizer
    const clean_layers = real_type_mapping.getCanonicalLayers().filter(layer => layer !== 'venue').sort();

    let clean = { text: 'foo', layers: clean_layers, negative_layers: ['-venue'], positive_layers: []};

    const expected_layers = clean_layers.filter(layer => layer !== 'address').sort();

    t.deepEqual(real_sanitizer.sanitize(null, clean), STD_MESSAGES);
    t.deepEqual(clean.layers.sort(), expected_layers, 'layer list is reduced to exclude addresses');
    t.end();
  });
};

module.exports.tests.tricky_inputs = function (test, common) {
  let tm = new TypeMapping();
  tm.setLayersBySource({ A: ['A'], B: ['B'], C: ['C'] });
  tm.generateMappings();
  let s = sanitizer(tm);

  test('tricky inputs - extra whitespace', (t) => {
    let clean = { text: ' \t\n  12 \n\t ' };
    t.deepEqual(s.sanitize(null, clean), STD_MESSAGES);
    t.deepEqual(clean.layers, ['A', 'B', 'C']);
    t.end();
  });

  test('tricky inputs - trailing whitespace', (t) => {
    let clean = { text: '12 ' };
    t.deepEqual(s.sanitize(null, clean), STD_MESSAGES);
    t.deepEqual(clean.layers, ['A', 'B', 'C']);
    t.end();
  });
};

// handle cases where a parser has run and removed admin tokens
module.exports.tests.parsed_text = function (test, common) {
  let tm = new TypeMapping();
  tm.setLayersBySource({ A: ['A'], B: ['B'], C: ['C'] });
  tm.generateMappings();
  let s = sanitizer(tm);

  test('naive parser - apply filter due to comma being present', (t) => {
    let clean = { text: 'A', parsed_text: { name: '1', admin_parts: 'Avenue' } };
    t.deepEqual(s.sanitize(null, clean), STD_MESSAGES);
    t.deepEqual(clean.layers, ['A', 'B', 'C']);
    t.end();
  });

  test('pelias_parser/libpostal - do not apply filter for numeric addresses', (t) => {
    let clean = { text: 'A', parsed_text: { housenumber: '1', street: 'Main St' } };
    t.deepEqual(s.sanitize(null, clean), NO_MESSAGES);
    t.false(clean.layers);
    t.end();
  });

  test('pelias_parser/libpostal - apply filter for non-numeric addresses', (t) => {
    let clean = { text: 'A', parsed_text: { housenumber: 'Foo', street: 'Main St' } };
    t.deepEqual(s.sanitize(null, clean), STD_MESSAGES);
    t.deepEqual(clean.layers, ['A', 'B', 'C']);
    t.end();
  });
};

module.exports.all = function (tape, common) {
  function test(name, testFunction) {
    return tape('SANTIZE _address_layer_filter ' + name, testFunction);
  }

  for (var testCase in module.exports.tests) {
    module.exports.tests[testCase](test, common);
  }
};
