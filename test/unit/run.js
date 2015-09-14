
var tape = require('tape');
var common = {};

var tests = [
  require('./controller/index'),
  require('./controller/place'),
  require('./controller/search'),
  require('./service/mget'),
  require('./service/search'),
  require('./sanitiser/_sources'),
  require('./sanitiser/_boundary_country'),
  require('./sanitiser/search'),
  require('./sanitiser/_layers'),
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
  require('./sanitiser/_geo_common'),
  require('./middleware/distance'),
];

tests.map(function(t) {
  t.all(tape, common);
});
