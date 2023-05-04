var peliasQuery = require('pelias-query');
var _ = require('lodash');

module.exports = _.merge({}, peliasQuery.defaults, {

  'size': 20,
  'track_scores': true,
  'lang': 'en',

  'centroid:field': 'center_point',

  'sort:distance:order': 'asc',
  'sort:distance:distance_type': 'plane',

  'boundary:circle:radius': '50km',
  'boundary:circle:distance_type': 'plane',

  'boundary:rect:type': 'indexed',

  'ngram:analyzer': 'peliasQuery',
  'ngram:field': 'name.default',
  'ngram:boost': 100,
  'ngram:cutoff_frequency': 0.01,

  'phrase:analyzer': 'peliasQuery',
  'phrase:field': 'phrase.default',
  'phrase:boost': 1,
  'phrase:slop': 3,
  'phrase:cutoff_frequency': 0.01,

  'focus:function': 'exp',
  'focus:offset': '0km',
  'focus:scale': '50km',
  'focus:decay': 0.5,
  'focus:weight': 15,

  'function_score:score_mode': 'avg',
  'function_score:boost_mode': 'replace',

  'address:housenumber:analyzer': 'peliasHousenumber',
  'address:housenumber:field': 'address_parts.number',
  'address:housenumber:boost': 2,
  'address:housenumber:cutoff_frequency': 0.01,

  'address:street:analyzer': 'peliasQuery',
  'address:street:field': 'address_parts.street',
  'address:street:boost': 1,
  'address:street:cutoff_frequency': 0.01,

  'address:cross_street:analyzer': 'peliasQuery',
  'address:cross_street:field': 'address_parts.cross_street',
  'address:cross_street:boost': 5,
  'address:cross_street:cutoff_frequency': 0.01,

  'address:postcode:analyzer': 'peliasZip',
  'address:postcode:field': 'address_parts.zip',
  'address:postcode:boost': 2000,
  'address:postcode:cutoff_frequency': 0.01,

  // generic multi_match config
  'multi_match:type': 'cross_fields',
  'multi_match:ngrams_strict:type': 'phrase',
  'multi_match:first_tokens_only:type': 'phrase',
  'multi_match:boost_exact_matches:type': 'phrase',

  // setting 'cutoff_frequency' will result in very common
  // terms such as country not scoring at all
  // 'multi_match:cutoff_frequency': 0.01,

  'admin:country_a:analyzer': 'standard',
  'admin:country_a:field': 'parent.country_a.ngram',
  'admin:country_a:boost': 1,
  'admin:country_a:cutoff_frequency': 0.01,

  // these options affect the `boundary.country` hard filter
  'multi_match:boundary_country:analyzer': 'standard',
  'multi_match:boundary_country:fields': ['parent.country_a', 'parent.dependency_a'],

  // these options affect the `focus.country` hard filter
  'multi_match:focus_country:analyzer': 'standard',
  'multi_match:focus_country:fields': ['parent.country_a', 'parent.dependency_a'],
  'multi_match:focus_country:boost': 1.5,

  'admin:country:analyzer': 'peliasAdmin',
  'admin:country:field': 'parent.country.ngram',
  'admin:country:boost': 1,
  'admin:country:cutoff_frequency': 0.01,

  'admin:dependency:analyzer': 'peliasAdmin',
  'admin:dependency:field': 'parent.dependency.ngram',
  'admin:dependency:boost': 1,
  'admin:dependency:cutoff_frequency': 0.01,

  'admin:region:analyzer': 'peliasAdmin',
  'admin:region:field': 'parent.region.ngram',
  'admin:region:boost': 1,
  'admin:region:cutoff_frequency': 0.01,

  'admin:region_a:analyzer': 'peliasAdmin',
  'admin:region_a:field': 'parent.region_a.ngram',
  'admin:region_a:boost': 1,
  'admin:region_a:cutoff_frequency': 0.01,

  'admin:macroregion:analyzer': 'peliasAdmin',
  'admin:macroregion:field': 'parent.macroregion.ngram',
  'admin:macroregion:boost': 1,
  'admin:macroregion:cutoff_frequency': 0.01,

  'admin:county:analyzer': 'peliasAdmin',
  'admin:county:field': 'parent.county.ngram',
  'admin:county:boost': 1,
  'admin:county:cutoff_frequency': 0.01,

  'admin:localadmin:analyzer': 'peliasAdmin',
  'admin:localadmin:field': 'parent.localadmin.ngram',
  'admin:localadmin:boost': 1,
  'admin:localadmin:cutoff_frequency': 0.01,

  'admin:locality:analyzer': 'peliasAdmin',
  'admin:locality:field': 'parent.locality.ngram',
  'admin:locality:boost': 1,
  'admin:locality:cutoff_frequency': 0.01,

  'admin:locality_a:analyzer': 'peliasAdmin',
  'admin:locality_a:field': 'parent.locality_a.ngram',
  'admin:locality_a:boost': 1,
  'admin:locality_a:cutoff_frequency': 0.01,

  'admin:neighbourhood:analyzer': 'peliasAdmin',
  'admin:neighbourhood:field': 'parent.neighbourhood.ngram',
  'admin:neighbourhood:boost': 1,
  'admin:neighbourhood:cutoff_frequency': 0.01,

  'admin:borough:analyzer': 'peliasAdmin',
  'admin:borough:field': 'parent.borough.ngram',
  'admin:borough:boost': 1,
  'admin:borough:cutoff_frequency': 0.01,

  // an additional 'name' field to add to admin multi-match queries.
  // this is used to improve venue matching in cases where the we
  // are unsure if the tokens represent admin or name components.
  'admin:add_name_to_multimatch:field': 'name.default',
  'admin:add_name_to_multimatch:boost': 1.5,
  'admin:add_name_lang_to_multimatch:field': 'name.en',
  'admin:add_name_lang_to_multimatch:boost': 1.5,

  'popularity:field': 'popularity',
  'popularity:modifier': 'log1p',
  'popularity:max_boost': 20,
  'popularity:weight': 1,

  'population:field': 'population',
  'population:modifier': 'log1p',
  'population:max_boost': 20,
  'population:weight': 3,

  // boost_sources_and_layers view
  'custom:boosting:min_score': 1,           // score applied to documents which don't score anything via functions
  'custom:boosting:boost': 5,               // multiply score by this number to increase the strength of the boost
  'custom:boosting:max_boost': 50,          // maximum boosting which can be applied (max_boost/boost = max_score)
  'custom:boosting:score_mode': 'sum',      // sum all function scores before multiplying the boost
  'custom:boosting:boost_mode': 'multiply'  // this mode is not relevant because there is no query section
});
