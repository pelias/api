var tape = require('tape'),
    diff = require('difflet')({ indent : 2, comment : true });

var common = {
  // a visual deep diff rendered using console.error()
  diff: function( actual, expected ){
    console.error( diff.compare( actual, expected ) );
  }
};

var tests = [
  require('./controller/index'),
  require('./controller/place'),
  require('./controller/search'),
  require('./helper/geojsonify'),
  require('./helper/labelGenerator_examples'),
  require('./helper/labelGenerator_default'),
  require('./helper/labelGenerator_CAN'),
  require('./helper/labelGenerator_GBR'),
  require('./helper/labelGenerator_USA'),
  require('./helper/labelSchema'),
  require('./helper/logging'),
  require('./helper/type_mapping'),
  require('./helper/sizeCalculator'),
  require('./middleware/access_log'),
  require('./middleware/confidenceScore'),
  require('./middleware/confidenceScoreReverse'),
  require('./middleware/distance'),
  require('./middleware/localNamingConventions'),
  require('./middleware/dedupe'),
  require('./middleware/parseBBox'),
  require('./middleware/sendJSON'),
  require('./middleware/normalizeParentIds'),
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
  require('./sanitiser/_sources_and_layers'),
  require('./sanitiser/_text'),
  require('./sanitiser/_tokenizer'),
  require('./sanitiser/_deprecate_quattroshapes'),
  require('./sanitiser/_categories'),
  require('./src/backend'),
  require('./sanitiser/autocomplete'),
  require('./sanitiser/place'),
  require('./sanitiser/reverse'),
  require('./sanitiser/search'),
  require('./sanitiser/wrap'),
  require('./service/mget'),
  require('./service/search'),
];

tests.map(function(t) {
  t.all(tape, common);
});
