/*
 * Mapping from data layers to type values
 */

module.exports = {
  'venue': ['geoname','osmnode','osmway'],
  'address': ['osmaddress','openaddresses'],
  'country': ['admin0'],
  'region': ['admin1'],
  'county': ['admin2'],
  'locality': ['locality'],
  'localadmin': ['local_admin'],
  'neighbourhood': ['neighborhood'],
  'coarse': ['admin0','admin1','admin2','neighborhood','locality','local_admin'],
};
