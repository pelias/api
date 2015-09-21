var extend = require('extend');

var ALL_TYPES = [
  'geoname',
  'osmnode',
  'osmway',
  'admin0',
  'admin1',
  'admin2',
  'neighborhood',
  'locality',
  'local_admin',
  'osmaddress',
  'openaddresses'
];

var TYPE_TO_SOURCE = {
  'geoname': 'gn',
  'osmnode': 'osm',
  'osmway': 'osm',
  'admin0': 'qs',
  'admin1': 'qs',
  'admin2': 'qs',
  'neighborhood': 'qs',
  'locality': 'qs',
  'local_admin': 'qs',
  'osmaddress': 'osm',
  'openaddresses': 'oa'
};

/*
 * This doesn't include alias layers such as coarse
 */
var TYPE_TO_LAYER = {
  'geoname': 'venue',
  'osmnode': 'venue',
  'osmway': 'venue',
  'admin0': 'country',
  'admin1': 'region',
  'admin2': 'county',
  'neighborhood': 'neighbourhood',
  'locality': 'locality',
  'local_admin': 'localadmin',
  'osmaddress': 'address',
  'openaddresses': 'address'
};

var SOURCE_TO_TYPE = {
  'gn'            : ['geoname'],
  'geonames'      : ['geoname'],
  'oa'            : ['openaddresses'],
  'openaddresses' : ['openaddresses'],
  'qs'            : ['admin0', 'admin1', 'admin2', 'neighborhood', 'locality', 'local_admin'],
  'quattroshapes' : ['admin0', 'admin1', 'admin2', 'neighborhood', 'locality', 'local_admin'],
  'osm'           : ['osmaddress', 'osmnode', 'osmway'],
  'openstreetmap' : ['osmaddress', 'osmnode', 'osmway']
};

/**
 * This does not included alias layers, those are built separately
 */
var LAYER_TO_TYPE = {
  'venue': ['geoname','osmnode','osmway'],
  'address': ['osmaddress','openaddresses'],
  'country': ['admin0'],
  'region': ['admin1'],
  'county': ['admin2'],
  'locality': ['locality'],
  'localadmin': ['local_admin'],
  'neighbourhood': ['neighborhood']
};

var LAYER_ALIASES = {
  'coarse': ['admin0','admin1','admin2','neighborhood','locality','local_admin']
};

var LAYER_WITH_ALIASES_TO_TYPE = extend({}, LAYER_ALIASES, LAYER_TO_TYPE);

module.exports = {
  types_list: ALL_TYPES,
  type_to_source: TYPE_TO_SOURCE,
  type_to_layer: TYPE_TO_LAYER,
  source_to_type: SOURCE_TO_TYPE,
  layer_to_type: LAYER_TO_TYPE,
  layer_with_aliases_to_type: LAYER_WITH_ALIASES_TO_TYPE
};
