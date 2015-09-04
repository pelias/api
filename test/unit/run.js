
var tape = require('tape');
var common = {};

var tests = [
  require('./controller/index'),
  require('./controller/place'),
  require('./controller/search'),
  require('./service/mget'),
  require('./service/search'),
  require('./sanitiser/search'),
  require('./sanitiser/reverse'),
  require('./sanitiser/place'),
  require('./query/types'),
  require('./query/sort'),
  require('./query/search'),
  require('./query/reverse'),
  require('./helper/query_parser'),
  require('./helper/geojsonify'),
  require('./helper/outputSchema'),
  require('./helper/adminFields'),
  require('./helper/types'),
];

tests.map(function(t) {
  t.all(tape, common);
});
