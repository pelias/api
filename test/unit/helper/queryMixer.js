
var query_mixer = require('../../../helper/queryMixer.json');
var indeces = require('../../../query/indeces');

module.exports.tests = {};

module.exports.tests.interface = function(test, common) {
  test('interface', function(t) {
    t.equal(typeof query_mixer, 'object', 'valid object');
    t.equal(query_mixer.hasOwnProperty('suggest'), true, 'has suggest defined');
    t.equal(query_mixer.hasOwnProperty('suggest_nearby'), true, 'has suggest_nearby defined');
    t.end();
  });
};

module.exports.tests.valid = function(test, common) {
  var valid_keys = ['layers', 'precision', 'fuzzy'];
  var valid_fuzzy_vals = ['AUTO', 0, 1, 2];
  var valid_layer_vals = indeces;

  var isValidPrecision = function(t, precisionArr) {
    precisionArr.forEach(function(precision) {
      t.notEqual(isNaN(precision), true, precision + ' is a valid precision value');
    });
  };

  var isValidLayer = function(t, layerArr) {
    layerArr.forEach(function(this_layer) {
      t.notEqual(valid_layer_vals.indexOf(this_layer), -1, 'layer value ' + this_layer + ' is valid');  
    });
  };

  var isValid = function(key, mix) {
    test('valid mix (' + key + ')' , function(t) {
      t.equal(keys.length > 0, true, 'valid key');  
      t.equal(Array.isArray( mix ), true, 'is an array');
      t.equal(mix.length > 0, true, 'is not an empty array');
      mix.forEach( function(this_mix) {
        t.notEqual(Object.getOwnPropertyNames(this_mix).length, 0,  'object not empty');
        for (var keys in this_mix) {
          t.notEqual(valid_keys.indexOf(keys), -1, keys + ' is valid');
          switch(keys) {
            case 'fuzzy':
              t.notEqual(valid_fuzzy_vals.indexOf(this_mix[keys]), -1, 'fuzzy value ' + this_mix[keys] + ' is valid');
              break;
            case 'layers':
              t.equal(Array.isArray(this_mix[keys]), true, 'layers is an array');
              t.equal(this_mix[keys].length > 0, true, 'layers is not an empty array');
              isValidLayer(t, this_mix[keys]);
              break;
            case 'precision':
              t.equal(Array.isArray( this_mix[keys] ), true, keys + ' is an array');
              if (this_mix[keys].length > 0) {
                isValidPrecision(t, this_mix[keys]);
              }
              break;
            default: 
              break;
          }
        }
      });
      t.end();
    });
  };

  for (var keys in query_mixer) { 
    isValid(keys, query_mixer[keys]);
  }
};

module.exports.all = function (tape, common) {

  function test(name, testFunction) {
    return tape('query_mixer: ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};