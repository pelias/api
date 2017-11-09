module.exports = {
  cascading_fallback: require('./search'),
  very_old_prod: require('./search_original'),
  structured_geocoding: require('./structured_geocoding'),
  reverse: require('./reverse'),
  autocomplete: require('./autocomplete'),
  address_using_ids: require('./address_search_using_ids'),
  venues: require('./venues')
};
