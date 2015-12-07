
var tape = require('tape');
var common = {};

var tests = [
  require('./controller/index'),
  require('./controller/place'),
  require('./controller/search'),
  require('./helper/geojsonify'),
  require('./helper/labelGenerator'),
  require('./helper/labelSchema'),
  require('./helper/text_parser'),
  require('./helper/type_mapping'),
  require('./helper/types'),
  require('./helper/sizeCalculator'),
  require('./middleware/confidenceScore'),
  require('./middleware/confidenceScoreReverse'),
  require('./middleware/distance'),
  require('./middleware/localNamingConventions'),
  require('./middleware/dedupe'),
  require('./query/autocomplete'),
  require('./query/autocomplete_defaults'),
  require('./query/search_defaults'),
  require('./query/reverse_defaults'),
  require('./query/reverse'),
  require('./query/search'),
  require('./sanitiser/_boundary_country'),
  require('./sanitiser/_flag_bool'),
  require('./sanitiser/_geo_common'),
  require('./sanitiser/_geo_reverse'),
  require('./sanitiser/_groups'),
  require('./sanitiser/_ids'),
  require('./sanitiser/_layers'),
  require('./sanitiser/_single_scalar_parameters'),
  require('./sanitiser/_size'),
  require('./sanitiser/_sources'),
  require('./sanitiser/_text'),
  require('./sanitiser/autocomplete'),
  require('./sanitiser/place'),
  require('./sanitiser/reverse'),
  require('./sanitiser/search'),
  require('./service/mget'),
  require('./service/search'),
];

tests.map(function(t) {
  t.all(tape, common);
});
