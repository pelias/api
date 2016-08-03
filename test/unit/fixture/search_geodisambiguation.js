module.exports = {
  'query': {
    'bool': {
      'should': [
        {
          'bool': {
            'must': [
              {
                'multi_match': {
                  'query': 'neighbourhood value',
                  'type': 'phrase',
                  'fields': [
                    'parent.neighbourhood',
                    'parent.neighbourhood_a'
                  ]
                }
              }
            ],
            'filter': {
              'term': {
                'layer': 'neighbourhood'
              }
            }
          }
        },
        {
          'bool': {
            'must': [
              {
                'multi_match': {
                  'query': 'neighbourhood value',
                  'type': 'phrase',
                  'fields': [
                    'parent.borough',
                    'parent.borough_a'
                  ]
                }
              }
            ],
            'filter': {
              'term': {
                'layer': 'borough'
              }
            }
          }
        },
        {
          'bool': {
            'must': [
              {
                'multi_match': {
                  'query': 'neighbourhood value',
                  'type': 'phrase',
                  'fields': [
                    'parent.locality',
                    'parent.locality_a'
                  ]
                }
              }
            ],
            'filter': {
              'term': {
                'layer': 'locality'
              }
            }
          }
        },
        {
          'bool': {
            'must': [
              {
                'multi_match': {
                  'query': 'neighbourhood value',
                  'type': 'phrase',
                  'fields': [
                    'parent.localadmin',
                    'parent.localadmin_a'
                  ]
                }
              }
            ],
            'filter': {
              'term': {
                'layer': 'localadmin'
              }
            }
          }
        },
        {
          'bool': {
            'must': [
              {
                'multi_match': {
                  'query': 'neighbourhood value',
                  'type': 'phrase',
                  'fields': [
                    'parent.county',
                    'parent.county_a'
                  ]
                }
              }
            ],
            'filter': {
              'term': {
                'layer': 'county'
              }
            }
          }
        },
        {
          'bool': {
            'must': [
              {
                'multi_match': {
                  'query': 'neighbourhood value',
                  'type': 'phrase',
                  'fields': [
                    'parent.macrocounty',
                    'parent.macrocounty_a'
                  ]
                }
              }
            ],
            'filter': {
              'term': {
                'layer': 'macrocounty'
              }
            }
          }
        },
        {
          'bool': {
            'must': [
              {
                'multi_match': {
                  'query': 'neighbourhood value',
                  'type': 'phrase',
                  'fields': [
                    'parent.region',
                    'parent.region_a'
                  ]
                }
              }
            ],
            'filter': {
              'term': {
                'layer': 'region'
              }
            }
          }
        },
        {
          'bool': {
            'must': [
              {
                'multi_match': {
                  'query': 'neighbourhood value',
                  'type': 'phrase',
                  'fields': [
                    'parent.macroregion',
                    'parent.macroregion_a'
                  ]
                }
              }
            ],
            'filter': {
              'term': {
                'layer': 'macroregion'
              }
            }
          }
        },
        {
          'bool': {
            'must': [
              {
                'multi_match': {
                  'query': 'neighbourhood value',
                  'type': 'phrase',
                  'fields': [
                    'parent.country',
                    'parent.country_a'
                  ]
                }
              }
            ],
            'filter': {
              'term': {
                'layer': 'country'
              }
            }
          }
        }
      ]
    }
  },
  'size': 20,
  'track_scores': true
};
