const _ = require('lodash');
const TypeMapping = require('../../../helper/TypeMapping');

module.exports.tests = {};

module.exports.tests.interface = function(test) {
  test('valid interface', function(t) {
    t.equal(typeof TypeMapping, 'function', 'TypeMapping is a function');

    t.equal(typeof TypeMapping.addStandardTargetsToAliases, 'function', 'addStandardTargetsToAliases() is a function');
    t.equal(typeof TypeMapping.prototype.setSourceAliases, 'function', 'setSourceAliases() is a function');

    t.equal(typeof TypeMapping.prototype.setLayersBySource, 'function', 'setLayersBySource() is a function');
    t.equal(typeof TypeMapping.prototype.setLayerAliases, 'function', 'setLayerAliases() is a function');

    t.equal(typeof TypeMapping.prototype.generateMappings, 'function', 'generateMappings() is a function');

    t.equal(typeof TypeMapping.prototype.loadTargets, 'function', 'loadTargets() is a function');
    t.equal(typeof TypeMapping.prototype.load, 'function', 'load() is a function');

    t.end();
  });
};

module.exports.tests.constructor = function(test) {
  test('constructor', function(t) {

    var doc = new TypeMapping();

    // initial values
    t.deepEqual(doc.sources, [], 'initial value');
    t.deepEqual(doc.source_aliases, {}, 'initial value');
    t.deepEqual(doc.layers, [], 'initial value');
    t.deepEqual(doc.layers_by_source, {}, 'initial value');
    t.deepEqual(doc.layer_aliases, {}, 'initial value');
    t.deepEqual(doc.source_mapping, {}, 'initial value');
    t.deepEqual(doc.layer_mapping, {}, 'initial value');

    t.end();
  });
};

module.exports.tests.addStandardTargetsToAliases = function(test) {
  test('static method addStandardTargetsToAliases', function(t) {

    var aliases = { test: ['test2'] };

    t.deepEqual(
      TypeMapping.addStandardTargetsToAliases([], aliases),
      { test: ['test2'] }
    );
    t.deepEqual(aliases, aliases, 'aliases object not mutated');

    t.deepEqual(
      TypeMapping.addStandardTargetsToAliases(['test'], aliases),
      { test: ['test2'] },
      'not modified'
    );
    t.deepEqual(aliases, aliases, 'aliases object not mutated');

    t.deepEqual(
      TypeMapping.addStandardTargetsToAliases(['baz'], aliases),
      { test: ['test2'], baz: ['baz'] }
    );
    t.deepEqual(aliases, aliases, 'aliases object not mutated');

    t.deepEqual(
      TypeMapping.addStandardTargetsToAliases(['baz','boo'], aliases),
      { test: ['test2'], baz: ['baz'], boo: ['boo'] }
    );
    t.deepEqual(aliases, aliases, 'aliases object not mutated');

    t.end();

  });
};

module.exports.tests.setSourceAliases = function(test) {
  test('setter setSourceAliases', function(t) {
    var tm = new TypeMapping();
    t.deepEqual(tm.source_aliases, {});
    tm.setSourceAliases({ foo: ['foo', 'bar'] });
    t.deepEqual(tm.source_aliases, { foo: ['foo', 'bar'] });
    t.end();
  });
};

module.exports.tests.setLayersBySource = function(test) {
  test('setter setLayersBySource', function(t) {
    var tm = new TypeMapping();
    t.deepEqual(tm.layers_by_source, {});
    tm.setLayersBySource({ foo: ['foo', 'bar'] });
    t.deepEqual(tm.layers_by_source, { foo: ['foo', 'bar'] });
    t.end();
  });
};

module.exports.tests.setLayerAliases = function(test) {
  test('setter setLayerAliases', function(t) {
    var tm = new TypeMapping();
    t.deepEqual(tm.layer_aliases, {});
    tm.setLayerAliases({ foo: ['foo', 'bar'] });
    t.deepEqual(tm.layer_aliases, { foo: ['foo', 'bar'] });
    t.end();
  });
};

module.exports.tests.generateMappings = function(test) {
  test('generateMappings - no-op', function(t) {
    var tm = new TypeMapping();
    t.deepEqual(tm.sources, []);
    t.deepEqual(tm.source_mapping, {});
    t.deepEqual(tm.layers, []);
    t.deepEqual(tm.layer_mapping, {});
    tm.generateMappings();
    t.deepEqual(tm.sources, []);
    t.deepEqual(tm.source_mapping, {});
    t.deepEqual(tm.layers, []);
    t.deepEqual(tm.layer_mapping, {});
    t.end();
  });
  test('generateMappings - sources', function(t) {
    var tm = new TypeMapping();
    tm.layers_by_source = { foo: ['foo'], faz: ['faz'] };
    tm.generateMappings();
    t.deepEqual(tm.sources, ['foo', 'faz']);
    t.end();
  });
  test('generateMappings - source_mapping', function(t) {
    var tm = new TypeMapping();
    tm.layers_by_source = { foo: ['foo'], faz: ['faz'] };
    tm.source_aliases = { foo: ['foo','f'], bar: ['bar', 'b'], baz: ['baz'] };
    tm.generateMappings();
    t.deepEqual(tm.source_mapping, { foo: ['foo', 'f'], bar: ['bar', 'b'], baz: ['baz'], faz: ['faz'] });
    t.end();
  });
  test('generateMappings - layers', function(t) {
    var tm = new TypeMapping();
    tm.layers_by_source = { foo: ['foo'], faz: ['faz'] };
    tm.generateMappings();
    t.deepEqual(tm.layers, ['foo','faz']);
    t.end();
  });
  test('generateMappings - layer_mapping', function(t) {
    var tm = new TypeMapping();
    tm.layers_by_source = { foo: ['foo'], faz: ['faz'] };
    tm.layer_aliases = { foo: ['foo','f'], bar: ['bar', 'b'], baz: ['baz'] };
    tm.generateMappings();
    t.deepEqual(tm.layer_mapping, { foo: ['foo', 'f'], bar: ['bar', 'b'], baz: ['baz'], faz: ['faz'] });
    t.end();
  });
};

module.exports.tests.loadTargets = function(test) {
  test('loadTargets - undefined', function(t) {
    var tm = new TypeMapping();
    tm.loadTargets();
    t.deepEqual(tm.sources, []);
    t.deepEqual(tm.source_mapping, {});
    t.deepEqual(tm.layers, []);
    t.deepEqual(tm.layer_mapping, {});
    t.end();
  });
  test('loadTargets', function(t) {
    var tm = new TypeMapping();
    tm.loadTargets({
      source_aliases: { source1: ['s1', 's2'], source2: ['s3', 's4'] },
      layers_by_source: { source1: ['layer1', 'layer3'], source2: ['layer2'] },
      layer_aliases: { layer1: ['l1', 'l2'], layer2: ['l3', 'l4'] },
    });
    t.deepEqual(tm.sources, [ 'source1', 'source2' ]);
    t.deepEqual(tm.source_mapping, { source1: [ 's1', 's2' ], source2: [ 's3', 's4' ] });
    t.deepEqual(tm.layers, [ 'layer1', 'layer3', 'layer2' ]);
    t.deepEqual(tm.layer_mapping, { layer1: [ 'l1', 'l2' ], layer2: [ 'l3', 'l4' ], layer3: [ 'layer3' ] });
    t.end();
  });
};

module.exports.tests.load = function(test) {
  test('load from pelias config', function(t) {
    var tm = new TypeMapping();
    tm.load(() => {

      // load pelias config
      const expected = _.get(
        require('pelias-config').generate(require('../../../schema')),
        'api.targets', {}
      );

      // values copied from config
      t.deepEqual(tm.layers_by_source, expected.layers_by_source || {});
      t.deepEqual(tm.source_aliases, expected.source_aliases || {});
      t.deepEqual(tm.layer_aliases, expected.layer_aliases || {});
      t.end();
    });
  });
};

module.exports.all = function (tape, common) {

  function test(name, testFunction) {
    return tape('TypeMapping: ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
