
var tape = require('tape');
var common = {};

var tests = [
  require('./controller/index'),
  require('./controller/place'),
  require('./controller/search'),
  require('./service/mget'),
  require('./service/search'),
  require('./sanitiser/_ids'),
  require('./sanitiser/_flag_bool'),
  require('./sanitiser/autocomplete'),
  require('./sanitiser/_sources'),
  require('./sanitiser/_boundary_country'),
  require('./sanitiser/search'),
  require('./sanitiser/_layers'),
  require('./sanitiser/reverse'),
  require('./sanitiser/place'),
  require('./query/search'),
  require('./query/autocomplete'),
  require('./query/reverse'),
  require('./query/defaults'),
  require('./query/view/temp_ngrams_strip_housenumbers'),
  require('./helper/query_parser'),
  require('./helper/geojsonify'),
  require('./helper/outputSchema'),
  require('./helper/types'),
  require('./helper/type_mapping'),
  require('./sanitiser/_geo_common'),
  require('./middleware/distance'),
  require('./middleware/confidenceScoreReverse'),
  require('./middleware/confidenceScore'),
  require('./sanitiser/_size'),
  require('./sanitiser/_single_scalar_parameters'),
  require('./sanitiser/_geo_reverse'),
];

tests.map(function(t) {
  t.all(tape, common);
});
