
var tape = require('tape');
var common = {};

var tests = [
  require('./controller/index'),
  require('./controller/doc'),
  require('./controller/search'),
  require('./service/mget'),
  require('./service/search'),
  require('./sanitiser/_alpha3'),
  require('./sanitiser/suggest'),
  require('./sanitiser/search'),
  require('./sanitiser/reverse'),
  require('./sanitiser/doc'),
  require('./sanitiser/coarse'),
  require('./query/indeces'),
  require('./query/sort'),
  require('./query/search'),
  require('./query/reverse'),
  require('./helper/query_parser'),
  require('./helper/geojsonify'),
  require('./helper/outputSchema')
];

tests.map(function(t) {
  t.all(tape, common);
});
