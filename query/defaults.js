
var peliasQuery = require('pelias-query'),
    extend = require('extend');

module.exports = extend( false, peliasQuery.defaults, {

  'size': 10,
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

  'phrase:analyzer': 'peliasPhrase',
  'phrase:field': 'phrase.default',
  'phrase:boost': 1,
  'phrase:slop': 2,

  'focus:function': 'linear',
  'focus:offset': '1km',
  'focus:scale': '50km',
  'focus:decay': 0.5,

  'function_score:score_mode': 'avg',
  'function_score:boost_mode': 'replace',

  'address:housenumber:analyzer': 'standard',
  'address:housenumber:field': 'address.number',
  'address:housenumber:boost': 1,

  'address:street:analyzer': 'standard',
  'address:street:field': 'address.street',
  'address:street:boost': 1,

  'address:postcode:analyzer': 'standard',
  'address:postcode:field': 'address.zip',
  'address:postcode:boost': 1,

  'admin:alpha3:analyzer': 'standard',
  'admin:alpha3:field': 'alpha3',
  'admin:alpha3:boost': 1,

  'admin:admin0:analyzer': 'peliasAdmin',
  'admin:admin0:field': 'admin0',
  'admin:admin0:boost': 1,

  'admin:admin1:analyzer': 'peliasAdmin',
  'admin:admin1:field': 'admin1',
  'admin:admin1:boost': 1,

  'admin:admin1_abbr:analyzer': 'peliasAdmin',
  'admin:admin1_abbr:field': 'admin1_abbr',
  'admin:admin1_abbr:boost': 1,

  'admin:admin2:analyzer': 'peliasAdmin',
  'admin:admin2:field': 'admin2',
  'admin:admin2:boost': 1,

  'admin:local_admin:analyzer': 'peliasAdmin',
  'admin:local_admin:field': 'local_admin',
  'admin:local_admin:boost': 1,

  'admin:locality:analyzer': 'peliasAdmin',
  'admin:locality:field': 'locality',
  'admin:locality:boost': 1,

  'admin:neighborhood:analyzer': 'peliasAdmin',
  'admin:neighborhood:field': 'neighborhood',
  'admin:neighborhood:boost': 1

});