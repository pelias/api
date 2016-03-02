module.exports = {
  'USA': {
    'local': ['localadmin', 'locality', 'neighbourhood', 'county'],
    'regional': ['region_a', 'region'],
    'country': ['country_a']
  },
  'GBR': {
    'local': ['neighbourhood', 'county', 'localadmin', 'locality', 'region'],
    'regional': ['county','country','region']
  },
  'SGP': {
    'local': ['neighbourhood', 'region', 'county', 'localadmin', 'locality'],
    'regional': ['county','country','region']
  },
  'SWE': {
    'local': ['neighbourhood', 'region', 'county', 'localadmin', 'locality'],
    'regional': ['country']
  },
  'default': {
    'local': ['localadmin', 'locality', 'neighbourhood', 'county', 'region'],
    'regional': ['country']
  }
};
