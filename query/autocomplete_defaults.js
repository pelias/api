
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

  'ngram:analyzer': 'peliasPhrase',
  'ngram:field': 'name.default',
  'ngram:boost': 100,

  'phrase:analyzer': 'peliasPhrase',
  'phrase:field': 'phrase.default',
  'phrase:boost': 1,
  'phrase:slop': 2,

  'focus:function': 'linear',
  'focus:offset': '0km',
  'focus:scale': '250km',
  'focus:decay': 0.5,
  'focus:weight': 10,

  'function_score:score_mode': 'avg',
  'function_score:boost_mode': 'multiply',

  'address:housenumber:analyzer': 'peliasHousenumber',
  'address:housenumber:field': 'address.number',
  'address:housenumber:boost': 2,

  'address:street:analyzer': 'peliasStreet',
  'address:street:field': 'address.street',
  'address:street:boost': 5,

  'address:postcode:analyzer': 'peliasZip',
  'address:postcode:field': 'address.zip',
  'address:postcode:boost': 2000,

  'admin:alpha3:analyzer': 'standard',
  'admin:alpha3:field': 'alpha3',
  'admin:alpha3:boost': 1000,

  'admin:admin0:analyzer': 'peliasAdmin',
  'admin:admin0:field': 'admin0',
  'admin:admin0:boost': 800,

  'admin:admin1:analyzer': 'peliasAdmin',
  'admin:admin1:field': 'admin1',
  'admin:admin1:boost': 600,

  'admin:admin1_abbr:analyzer': 'peliasAdmin',
  'admin:admin1_abbr:field': 'admin1_abbr',
  'admin:admin1_abbr:boost': 600,

  'admin:admin2:analyzer': 'peliasAdmin',
  'admin:admin2:field': 'admin2',
  'admin:admin2:boost': 400,

  'admin:local_admin:analyzer': 'peliasAdmin',
  'admin:local_admin:field': 'local_admin',
  'admin:local_admin:boost': 200,

  'admin:locality:analyzer': 'peliasAdmin',
  'admin:locality:field': 'locality',
  'admin:locality:boost': 200,

  'admin:neighborhood:analyzer': 'peliasAdmin',
  'admin:neighborhood:field': 'neighborhood',
  'admin:neighborhood:boost': 200,

  'popularity:field': 'popularity',
  'popularity:modifier': 'log1p',
  'popularity:max_boost': 20,
  'popularity:weight': 1,

  'population:field': 'population',
  'population:modifier': 'log1p',
  'population:max_boost': 20,
  'population:weight': 3

});
