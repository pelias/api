/*
 * Mapping from data sources to type values
 */

module.exports = {
  'gn'            : ['geoname'],
  'geonames'      : ['geoname'],
  'oa'            : ['openaddresses'],
  'openaddresses' : ['openaddresses'],
  'qs'            : ['admin0', 'admin1', 'admin2', 'neighborhood', 'locality', 'local_admin'],
  'quattroshapes' : ['admin0', 'admin1', 'admin2', 'neighborhood', 'locality', 'local_admin'],
  'osm'           : ['osmaddress', 'osmnode', 'osmway'],
  'openstreetmap' : ['osmaddress', 'osmnode', 'osmway']
};
