var tape = require('tape'),
    diff = require('difflet')({ indent : 2, comment : true });

var common = {
  // a visual deep diff rendered using console.error()
  diff: function( actual, expected ){
    console.error( diff.compare( actual, expected ) );
  }
};

var tests = [
  require('./app'),
  require('./schema'),
  require('./controller/coarse_reverse'),
  require('./controller/index'),
  require('./controller/libpostal'),
  require('./controller/structured_libpostal'),
  require('./controller/place'),
  require('./controller/placeholder'),
  require('./controller/search'),
  require('./controller/predicates/hasParsedTextProperties'),
  require('./controller/predicates/hasRequestParameter'),
  require('./controller/predicates/hasResponseData'),
  require('./controller/predicates/hasResultsAtLayers'),
  require('./controller/predicates/hasRequestParameter'),
  require('./controller/predicates/hasRequestErrors'),
  require('./controller/predicates/isPeliasParse'),
  require('./controller/predicates/isAdminOnlyAnalysis'),
  require('./controller/predicates/isCoarseReverse'),
  require('./controller/predicates/isOnlyNonAdminLayers'),
  require('./controller/predicates/isRequestLayersAnyAddressRelated'),
  require('./controller/predicates/isRequestSourcesIncludesWhosOnFirst'),
  require('./controller/predicates/isRequestSourcesOnlyWhosOnFirst'),
  require('./controller/predicates/isRequestSourcesUndefined'),
  require('./helper/debug'),
  require('./helper/decode_gid'),
  require('./helper/diffPlaces'),
  require('./helper/fieldValue'),
  require('./helper/geojsonify_place_details'),
  require('./helper/geojsonify'),
  require('./helper/iso3166'),
  require('./helper/logging'),
  require('./helper/TypeMapping'),
  require('./helper/type_mapping'),
  require('./helper/stackTraceLine'),
  require('./helper/unicode'),
  require('./middleware/access_log'),
  require('./middleware/accuracy'),
  require('./middleware/applyOverrides'),
  require('./middleware/assignLabels'),
  require('./middleware/confidenceScore'),
  require('./middleware/confidenceScoreFallback'),
  require('./middleware/confidenceScoreReverse'),
  require('./middleware/changeLanguage'),
  require('./middleware/distance'),
  require('./middleware/interpolate'),
  require('./middleware/localNamingConventions'),
  require('./middleware/dedupe'),
  require('./middleware/parseBBox'),
  require('./middleware/sendJSON'),
  require('./middleware/normalizeParentIds'),
  require('./middleware/sizeCalculator'),
  require('./middleware/sortResponseData'),
  require('./middleware/trimByGranularity'),
  require('./middleware/trimByGranularityStructured'),
  require('./middleware/requestLanguage'),
  require('./query/address_search_using_ids'),
  require('./query/autocomplete'),
  require('./query/autocomplete_token_matching_permutations'),
  require('./query/autocomplete_defaults'),
  require('./query/autocomplete_with_custom_boosts'),
  require('./query/reverse'),
  require('./query/reverse_defaults'),
  require('./query/search'),
  require('./query/search_with_custom_boosts'),
  require('./query/search_defaults'),
  require('./query/search_pelias_parser'),
  require('./query/structured_geocoding'),
  require('./query/text_parser'),
  require('./query/view/boost_sources_and_layers'),
  require('./query/view/max_character_count_layer_filter'),
  require('./sanitizer/_countries'),
  require('./sanitizer/_debug'),
  require('./sanitizer/_default_parameters'),
  require('./sanitizer/_flag_bool'),
  require('./sanitizer/_geonames_deprecation'),
  require('./sanitizer/_geonames_warnings'),
  require('./sanitizer/_geo_common'),
  require('./sanitizer/_geo_reverse'),
  require('./sanitizer/_groups'),
  require('./sanitizer/_ids'),
  require('./sanitizer/_iso2_to_iso3'),
  require('./sanitizer/_layers'),
  require('./sanitizer/_city_name_standardizer'),
  require('./sanitizer/_request_language'),
  require('./sanitizer/_single_scalar_parameters'),
  require('./sanitizer/_size'),
  require('./sanitizer/_sources'),
  require('./sanitizer/_sources_and_layers'),
  require('./sanitizer/_address_layer_filter'),
  require('./sanitizer/_synthesize_analysis'),
  require('./sanitizer/_text'),
  require('./sanitizer/_text_pelias_parser'),
  require('./sanitizer/_tokenizer'),
  require('./sanitizer/_categories'),
  require('./sanitizer/_gids'),
  require('./sanitizer/nearby'),
  require('./sanitizer/autocomplete'),
  require('./sanitizer/structured_geocoding'),
  require('./sanitizer/place'),
  require('./sanitizer/reverse'),
  require('./sanitizer/sanitizeAll'),
  require('./sanitizer/search'),
  require('./sanitizer/defer_to_pelias_parser'),
  require('./sanitizer/wrap'),
  require('./service/configurations/Interpolation'),
  require('./service/configurations/Language'),
  require('./service/configurations/Libpostal'),
  require('./service/configurations/PlaceHolder'),
  require('./service/configurations/PointInPolygon'),
  require('./service/mget'),
  require('./service/search')
];

tests.map(function(t) {
  t.all(tape, common);
});
