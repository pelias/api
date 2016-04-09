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
  require('./helper/iterate'),
  require('./helper/labelGenerator_default'),
  require('./helper/labelGenerator_GBR'),
  require('./helper/labelGenerator_SGP'),
  require('./helper/labelGenerator_SWE'),
  require('./helper/labelGenerator_USA'),
  require('./helper/labelSchema'),
  require('./helper/text_parser'),
  require('./helper/type_mapping'),
  require('./helper/sizeCalculator'),
  require('./middleware/bulkSizeLimit'),
  require('./middleware/confidenceScore'),
  require('./middleware/confidenceScoreReverse'),
  require('./middleware/distance'),
  require('./middleware/localNamingConventions'),
  require('./middleware/dedupe'),
  require('./middleware/parseBBox'),
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
  require('./sanitiser/_deprecate_quattroshapes'),
  require('./src/backend'),
  require('./sanitiser/autocomplete'),
  require('./sanitiser/place'),
  require('./sanitiser/reverse'),
  require('./sanitiser/search'),
  require('./service/mget'),
  require('./service/msearch'),
  require('./service/search'),
];

tests.map(function(t) {
  t.all(tape, common);
});
