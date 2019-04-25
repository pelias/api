const sanitizer = require('../../../sanitizer/_address_layer_filter');
const NO_MESSAGES = { errors: [], warnings: [] };
const STD_MESSAGES = { errors: [], warnings: ['performance optimization: excluding \'address\' layer'] };

module.exports.tests = {};

module.exports.tests.enumerate_layers = function (test, common) {
  test('enumerate layers', (t) => {
    let m = { A: ['A', 'B'], B: ['B'], C: ['B', 'C'] };
    t.deepEqual(sanitizer(m).layers, ['A','B','C']);
    t.end();
  });
  test('enumerate layers - exclude "address"', (t) => {
    let m = { A: ['A', 'B', 'address'], B: ['B'], C: ['B', 'address', 'C'] };
    t.deepEqual(sanitizer(m).layers, ['A', 'B', 'C']);
    t.end();
  });
};

module.exports.tests.sanitize = function (test, common) {
  let m = { A: ['A'], B: ['B'], C: ['C'] };
  let s = sanitizer(m);

  test('sanitize - do nothing if clean.layers already specified', (t) => {
    let clean = { text: '1 example', layers: ['not empty'] };
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
    let m = { A: ['A', 'address'], B: ['B', 'address'], C: ['C'] };
    let s = sanitizer(m);

    let clean = { text: 'foo', sources: [ 'A', 'C' ] };
    t.deepEqual(s.sanitize(null, clean), STD_MESSAGES);
    t.deepEqual(clean.layers, ['A', 'C']);
    t.end();
  });

  test('sanitize - do nothing for sources which do not have any addresses', (t) => {
    let m = { A: ['address'], B: ['address'] };
    let s = sanitizer(m);

    let clean = { text: 'foo', sources: ['A', 'B'] };
    t.deepEqual(s.sanitize(null, clean), NO_MESSAGES);
    t.false(clean.layers);
    t.end();
  });
};

module.exports.tests.tricky_inputs = function (test, common) {
  let m = { A: ['A'], B: ['B'], C: ['C'] };
  let s = sanitizer(m);

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
  let m = { A: ['A'], B: ['B'], C: ['C'] };
  let s = sanitizer(m);

  test('naive parser - apply filter due to comma being present', (t) => {
    let clean = { text: 'A', parsed_text: { name: '1', admin_parts: 'Avenue' } };
    t.deepEqual(s.sanitize(null, clean), STD_MESSAGES);
    t.deepEqual(clean.layers, ['A', 'B', 'C']);
    t.end();
  });

  test('addressit/libpostal - do not apply filter for numeric addresses', (t) => {
    let clean = { text: 'A', parsed_text: { number: '1', street: 'Main St' } };
    t.deepEqual(s.sanitize(null, clean), NO_MESSAGES);
    t.false(clean.layers);
    t.end();
  });

  test('addressit/libpostal - apply filter for non-numeric addresses', (t) => {
    let clean = { text: 'A', parsed_text: { number: 'Foo', street: 'Main St' } };
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
