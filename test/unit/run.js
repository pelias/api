
var tape = require('tape');
var common = {};

var tests = [
  require('./controller/index'),
  require('./controller/doc'),
  require('./controller/suggest'),
  require('./controller/search'),
  require('./service/mget'),
  require('./service/search'),
  require('./service/suggest'),
  require('./sanitiser/suggest'),
  require('./sanitiser/doc'),
  require('./sanitiser/coarse'),
  require('./query/indeces'),
  require('./query/suggest'),
  require('./query/sort'),
  require('./query/search'),
  require('./query/reverse'),
  require('./helper/geojsonify'),
  require('./helper/outputSchema'),
  require('./helper/queryMixer')
];

tests.map(function(t) {
  t.all(tape, common);
});