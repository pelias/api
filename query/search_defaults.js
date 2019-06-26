var peliasQuery = require('pelias-query');
var _ = require('lodash');

module.exports = _.merge({}, peliasQuery.defaults, {

  'size': 20,
  'track_scores': true,

  'centroid:field': 'center_point',

  'sort:distance:order': 'asc',
  'sort:distance:distance_type': 'plane',

  'boundary:circle:radius': '50km',
  'boundary:circle:distance_type': 'plane',

  'boundary:rect:type': 'indexed',

  'ngram:analyzer': 'peliasQueryFullToken',
  'ngram:field': 'name.default',
  'ngram:boost': 1,
  'ngram:cutoff_frequency': 0.01,

  'phrase:analyzer': 'peliasPhrase',
  'phrase:field': 'phrase.default',
  'phrase:boost': 1,
  'phrase:slop': 2,
  'phrase:cutoff_frequency': 0.01,

  'focus:function': 'exp',
  'focus:offset': '0km',
  'focus:scale': '50km',
  'focus:decay': 0.5,
  'focus:weight': 2,

  'function_score:score_mode': 'avg',
  'function_score:boost_mode': 'replace',

  'address:housenumber:analyzer': 'peliasHousenumber',
  'address:housenumber:field': 'address_parts.number',
  'address:housenumber:boost': 2,
  'address:housenumber:cutoff_frequency': 0.01,

  'address:street:analyzer': 'peliasStreet',
  'address:street:field': 'address_parts.street',
  'address:street:boost': 5,
  'address:street:cutoff_frequency': 0.01,

  'address:postcode:analyzer': 'peliasZip',
  'address:postcode:field': 'address_parts.zip',
  'address:postcode:boost': 20,
  'address:postcode:cutoff_frequency': 0.01,

  // generic multi_match cutoff_frequency
  'multi_match:cutoff_frequency': 0.01,

  'admin:country_a:analyzer': 'standard',
  'admin:country_a:field': 'parent.country_a',
  'admin:country_a:boost': 1,
  'admin:country_a:cutoff_frequency': 0.01,

  'admin:country:analyzer': 'peliasAdmin',
  'admin:country:field': 'parent.country',
  'admin:country:boost': 1,
  'admin:country:cutoff_frequency': 0.01,

  'admin:region:analyzer': 'peliasAdmin',
  'admin:region:field': 'parent.region',
  'admin:region:boost': 1,
  'admin:region:cutoff_frequency': 0.01,

  'admin:region_a:analyzer': 'peliasAdmin',
  'admin:region_a:field': 'parent.region_a',
  'admin:region_a:boost': 1,
  'admin:region_a:cutoff_frequency': 0.01,

  'admin:county:analyzer': 'peliasAdmin',
  'admin:county:field': 'parent.county',
  'admin:county:boost': 1,
  'admin:county:cutoff_frequency': 0.01,

  'admin:localadmin:analyzer': 'peliasAdmin',
  'admin:localadmin:field': 'parent.localadmin',
  'admin:localadmin:boost': 1,
  'admin:localadmin:cutoff_frequency': 0.01,

  'admin:locality:analyzer': 'peliasAdmin',
  'admin:locality:field': 'parent.locality',
  'admin:locality:boost': 1,
  'admin:locality:cutoff_frequency': 0.01,

  'admin:borough:analyzer': 'peliasAdmin',
  'admin:borough:field': 'parent.borough',
  'admin:borough:boost': 1,
  'admin:borough:cutoff_frequency': 0.01,

  'admin:neighbourhood:analyzer': 'peliasAdmin',
  'admin:neighbourhood:field': 'parent.neighbourhood',
  'admin:neighbourhood:boost': 1,
  'admin:neighbourhood:cutoff_frequency': 0.01,

  'popularity:field': 'popularity',
  'popularity:modifier': 'log1p',
  'popularity:max_boost': 20,
  'popularity:weight': 1,

  'population:field': 'population',
  'population:modifier': 'log1p',
  'population:max_boost': 20,
  'population:weight': 2,

  // used by fallback queries
  // @todo: it is also possible to specify layer boosting
  // via pelias/config, consider deprecating this config.
  'boost:address': 10,
  'boost:street': 5,

  // boost_sources_and_layers view
  'custom:boosting:min_score': 1,           // score applied to documents which don't score anything via functions
  'custom:boosting:boost': 5,               // multiply score by this number to increase the strength of the boost
  'custom:boosting:max_boost': 50,          // maximum boosting which can be applied (max_boost/boost = max_score)
  'custom:boosting:score_mode': 'sum',      // sum all function scores before multiplying the boost
  'custom:boosting:boost_mode': 'multiply'  // this mode is not relevant because there is no query section
});
