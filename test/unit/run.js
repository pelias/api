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
  require('./helper/diffPlaces'),
  require('./helper/geojsonify'),
  require('./helper/labelGenerator_examples'),
  require('./helper/labelGenerator_default'),
  require('./helper/labelGenerator_CAN'),
  require('./helper/labelGenerator_AUS'),
  require('./helper/labelGenerator_GBR'),
  require('./helper/labelGenerator_USA'),
  require('./helper/labelSchema'),
  require('./helper/logging'),
  require('./helper/type_mapping'),
  require('./helper/sizeCalculator'),
  require('./middleware/access_log'),
  require('./middleware/accuracy'),
  require('./middleware/confidenceScore'),
  require('./middleware/confidenceScoreFallback'),
  require('./middleware/confidenceScoreReverse'),
  require('./middleware/distance'),
  require('./middleware/localNamingConventions'),
  require('./middleware/dedupe'),
  require('./middleware/parseBBox'),
  require('./middleware/sendJSON'),
  require('./middleware/normalizeParentIds'),
  require('./middleware/trimByGranularity'),
  require('./query/autocomplete'),
  require('./query/autocomplete_defaults'),
  require('./query/search_defaults'),
  require('./query/reverse_defaults'),
  require('./query/reverse'),
  require('./query/search'),
  require('./query/search_original'),
  require('./query/text_parser'),
  require('./sanitizer/_boundary_country'),
  require('./sanitizer/_flag_bool'),
  require('./sanitizer/_geo_common'),
  require('./sanitizer/_geo_reverse'),
  require('./sanitizer/_groups'),
  require('./sanitizer/_ids'),
  require('./sanitizer/_layers'),
  require('./sanitizer/_single_scalar_parameters'),
  require('./sanitizer/_size'),
  require('./sanitizer/_sources'),
  require('./sanitizer/_sources_and_layers'),
  require('./sanitizer/_text'),
  require('./sanitizer/_text_addressit'),
  require('./sanitizer/_tokenizer'),
  require('./sanitizer/_deprecate_quattroshapes'),
  require('./sanitizer/_categories'),
  require('./sanitizer/nearby'),
  require('./src/backend'),
  require('./sanitizer/autocomplete'),
  require('./sanitizer/place'),
  require('./sanitizer/reverse'),
  require('./sanitizer/sanitizeAll'),
  require('./sanitizer/search'),
  require('./sanitizer/search_fallback'),
  require('./sanitizer/wrap'),
  require('./service/mget'),
  require('./service/search')
];

tests.map(function(t) {
  t.all(tape, common);
});
