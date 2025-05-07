var peliasQuery = require('pelias-query');
var _ = require('lodash');

module.exports = _.merge({}, peliasQuery.defaults, {

  'size': 1,
  'track_scores': true,
  'layers': ['venue', 'address', 'street'],

  'centroid:field': 'center_point',

  'sort:distance:order': 'asc',
  'sort:distance:distance_type': 'plane',

  'boundary:circle:radius': '1km',
  'boundary:circle:distance_type': 'plane',

  'ngram:analyzer': 'peliasQuery',
  'ngram:field': 'name.default',
  'ngram:boost': 1,

  'phrase:analyzer': 'peliasPhrase',
  'phrase:field': 'phrase.default',
  'phrase:boost': 1,
  'phrase:slop': 2,

  'focus:function': 'linear',
  'focus:offset': '0km',
  'focus:scale': '50km',
  'focus:decay': 0.5,
  'focus:weight': 2,

  'function_score:score_mode': 'avg',
  'function_score:boost_mode': 'replace',

  'address:housenumber:analyzer': 'peliasHousenumber',
  'address:housenumber:field': 'address_parts.number',
  'address:housenumber:boost': 2,

  'address:street:analyzer': 'peliasStreet',
  'address:street:field': 'address_parts.street',
  'address:street:boost': 5,

  'address:postcode:analyzer': 'peliasZip',
  'address:postcode:field': 'address_parts.zip',
  'address:postcode:boost': 3,

  'admin:country_a:analyzer': 'standard',
  'admin:country_a:field': 'parent.country_a',
  'admin:country_a:boost': 5,

  'admin:country:analyzer': 'peliasAdmin',
  'admin:country:field': 'parent.country',
  'admin:country:boost': 4,

  'admin:region:analyzer': 'peliasAdmin',
  'admin:region:field': 'parent.region',
  'admin:region:boost': 3,

  'admin:region_a:analyzer': 'peliasAdmin',
  'admin:region_a:field': 'parent.region_a',
  'admin:region_a:boost': 3,

  'admin:county:analyzer': 'peliasAdmin',
  'admin:county:field': 'parent.county',
  'admin:county:boost': 2,

  'admin:localadmin:analyzer': 'peliasAdmin',
  'admin:localadmin:field': 'parent.localadmin',
  'admin:localadmin:boost': 1,

  'admin:locality:analyzer': 'peliasAdmin',
  'admin:locality:field': 'parent.locality',
  'admin:locality:boost': 1,

  'admin:neighbourhood:analyzer': 'peliasAdmin',
  'admin:neighbourhood:field': 'parent.neighbourhood',
  'admin:neighbourhood:boost': 1,

  'popularity:field': 'popularity',
  'popularity:modifier': 'log1p',
  'popularity:max_boost': 20,
  'popularity:weight': 1,

  'population:field': 'population',
  'population:modifier': 'log1p',
  'population:max_boost': 20,
  'population:weight': 2

});
