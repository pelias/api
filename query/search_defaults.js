
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
  'boundary:circle:optimize_bbox': 'indexed',
  'boundary:circle:_cache': true,

  'boundary:rect:type': 'indexed',
  'boundary:rect:_cache': true,

  'ngram:analyzer': 'peliasOneEdgeGram',
  'ngram:field': 'name.default',
  'ngram:boost': 1,

  'multingram:fields': ['name.*'],

  'phrase:analyzer': 'peliasPhrase',
  'phrase:field': 'phrase.default',
  'phrase:boost': 1,
  'phrase:slop': 2,

  'focus:function': 'linear',
  'focus:offset': '1km',
  'focus:scale': '50km',
  'focus:decay': 0.5,
  'focus:weight': 2,

  'function_score:score_mode': 'avg',
  'function_score:boost_mode': 'replace',

  'address:housenumber:analyzer': 'peliasHousenumber',
  'address:housenumber:field': 'address.number',
  'address:housenumber:boost': 2,

  'address:street:analyzer': 'peliasStreet',
  'address:street:field': 'address.street',
  'address:street:boost': 5,

  'address:postcode:analyzer': 'peliasZip',
  'address:postcode:field': 'address.zip',
  'address:postcode:boost': 20,

  'admin:alpha3:analyzer': 'standard',
  'admin:alpha3:field': 'alpha3',
  'admin:alpha3:boost': 5,

  'admin:admin0:analyzer': 'peliasAdmin',
  'admin:admin0:field': 'admin0',
  'admin:admin0:boost': 4,

  'admin:admin1:analyzer': 'peliasAdmin',
  'admin:admin1:field': 'admin1',
  'admin:admin1:boost': 3,

  'admin:admin1_abbr:analyzer': 'peliasAdmin',
  'admin:admin1_abbr:field': 'admin1_abbr',
  'admin:admin1_abbr:boost': 3,

  'admin:admin2:analyzer': 'peliasAdmin',
  'admin:admin2:field': 'admin2',
  'admin:admin2:boost': 2,

  'admin:local_admin:analyzer': 'peliasAdmin',
  'admin:local_admin:field': 'local_admin',
  'admin:local_admin:boost': 1,

  'admin:locality:analyzer': 'peliasAdmin',
  'admin:locality:field': 'locality',
  'admin:locality:boost': 1,

  'admin:neighborhood:analyzer': 'peliasAdmin',
  'admin:neighborhood:field': 'neighborhood',
  'admin:neighborhood:boost': 1,

  'popularity:field': 'popularity',
  'popularity:modifier': 'log1p',
  'popularity:max_boost': 20,
  'popularity:weight': 1,

  'population:field': 'population',
  'population:modifier': 'log1p',
  'population:max_boost': 20,
  'population:weight': 2

});
