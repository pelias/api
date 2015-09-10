
var tape = require('tape');
var common = {};

var tests = [
  require('./controller/index'),
  require('./controller/place'),
  require('./controller/search'),
  require('./service/mget'),
  require('./service/search'),
  require('./sanitiser/_details'),
  require('./sanitiser/_source'),
  require('./sanitiser/_truthy'),
  require('./sanitiser/search'),
  require('./sanitiser/reverse'),
  require('./sanitiser/place'),
  require('./query/types'),
  require('./query/search'),
  require('./query/autocomplete'),
  require('./query/reverse'),
  require('./query/defaults'),
  require('./helper/query_parser'),
  require('./helper/geojsonify'),
  require('./helper/outputSchema'),
  require('./helper/types'),
];

tests.map(function(t) {
  t.all(tape, common);
});
