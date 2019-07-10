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

  'ngram:analyzer': 'peliasQuery',
  'ngram:field': 'name.default',
  'ngram:boost': 100,
  'ngram:cutoff_frequency': 0.01,

  'phrase:analyzer': 'peliasQuery',
  'phrase:field': 'name.default',
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

  'address:street:analyzer': 'peliasStreet',
  'address:street:field': 'address_parts.street',
  'address:street:boost': 5,
  'address:street:cutoff_frequency': 0.01,

  'address:postcode:analyzer': 'peliasZip',
  'address:postcode:field': 'address_parts.zip',
  'address:postcode:boost': 2000,
  'address:postcode:cutoff_frequency': 0.01,

  // generic multi_match cutoff_frequency
  'multi_match:cutoff_frequency': 0.01,

  'admin:country_a:analyzer': 'standard',
  'admin:country_a:field': 'parent.country_a.ngram',
  'admin:country_a:boost': 1000,
  'admin:country_a:cutoff_frequency': 0.01,

  'admin:country:analyzer': 'peliasAdmin',
  'admin:country:field': 'parent.country.ngram',
  'admin:country:boost': 800,
  'admin:country:cutoff_frequency': 0.01,

  'admin:region:analyzer': 'peliasAdmin',
  'admin:region:field': 'parent.region.ngram',
  'admin:region:boost': 600,
  'admin:region:cutoff_frequency': 0.01,

  'admin:region_a:analyzer': 'peliasAdmin',
  'admin:region_a:field': 'parent.region_a.ngram',
  'admin:region_a:boost': 600,
  'admin:region_a:cutoff_frequency': 0.01,

  'admin:county:analyzer': 'peliasAdmin',
  'admin:county:field': 'parent.county.ngram',
  'admin:county:boost': 400,
  'admin:county:cutoff_frequency': 0.01,

  'admin:localadmin:analyzer': 'peliasAdmin',
  'admin:localadmin:field': 'parent.localadmin.ngram',
  'admin:localadmin:boost': 200,
  'admin:localadmin:cutoff_frequency': 0.01,

  'admin:locality:analyzer': 'peliasAdmin',
  'admin:locality:field': 'parent.locality.ngram',
  'admin:locality:boost': 200,
  'admin:locality:cutoff_frequency': 0.01,

  'admin:neighbourhood:analyzer': 'peliasAdmin',
  'admin:neighbourhood:field': 'parent.neighbourhood.ngram',
  'admin:neighbourhood:boost': 200,
  'admin:neighbourhood:cutoff_frequency': 0.01,

  'admin:borough:analyzer': 'peliasAdmin',
  'admin:borough:field': 'parent.borough.ngram',
  'admin:borough:boost': 600,
  'admin:borough:cutoff_frequency': 0.01,

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
