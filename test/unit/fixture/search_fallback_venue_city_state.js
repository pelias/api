module.exports = {
  'query': {
    'function_score': {
      'query': {
        'bool': {
          'minimum_should_match': 1,
          'should': [
            {
              'bool': {
                '_name': 'fallback.venue',
                'must': [
                  {
                    'multi_match': {
                      'query': 'query value',
                      'type': 'phrase',
                      'fields': [
                        'phrase.default'
                      ]
                    }
                  },
                  {
                    'multi_match': {
                      'query': 'city value',
                      'type': 'phrase',
                      'fields': [
                        'parent.locality',
                        'parent.locality_a',
                        'parent.localadmin',
                        'parent.localadmin_a'
                      ]
                    }
                  },
                  {
                    'multi_match': {
                      'query': 'state value',
                      'type': 'phrase',
                      'fields': [
                        'parent.region',
                        'parent.region_a',
                        'parent.macroregion',
                        'parent.macroregion_a'
                      ]
                    }
                  }
                ],
                'filter': {
                  'term': {
                    'layer': 'venue'
                  }
                }
              }
            },
            {
              'bool': {
                '_name': 'fallback.locality',
                'must': [
                  {
                    'multi_match': {
                      'query': 'city value',
                      'type': 'phrase',
                      'fields': [
                        'parent.locality',
                        'parent.locality_a'
                      ]
                    }
                  },
                  {
                    'multi_match': {
                      'query': 'state value',
                      'type': 'phrase',
                      'fields': [
                        'parent.region',
                        'parent.region_a',
                        'parent.macroregion',
                        'parent.macroregion_a'
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
                '_name': 'fallback.localadmin',
                'must': [
                  {
                    'multi_match': {
                      'query': 'city value',
                      'type': 'phrase',
                      'fields': [
                        'parent.localadmin',
                        'parent.localadmin_a'
                      ]
                    }
                  },
                  {
                    'multi_match': {
                      'query': 'state value',
                      'type': 'phrase',
                      'fields': [
                        'parent.region',
                        'parent.region_a',
                        'parent.macroregion',
                        'parent.macroregion_a'
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
                '_name': 'fallback.region',
                'must': [
                  {
                    'multi_match': {
                      'query': 'state value',
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
                '_name': 'fallback.macroregion',
                'must': [
                  {
                    'multi_match': {
                      'query': 'state value',
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
            }
          ]
        }
      },
      'max_boost': 20,
      'functions': [
        {
          'field_value_factor': {
            'modifier': 'log1p',
            'field': 'popularity',
            'missing': 1
          },
          'weight': 1
        },
        {
          'field_value_factor': {
            'modifier': 'log1p',
            'field': 'population',
            'missing': 1
          },
          'weight': 2
        }
      ],
      'score_mode': 'avg',
      'boost_mode': 'multiply'
    }
  },
  'sort': [
    '_score'
  ],
  'size': 20,
  'track_scores': true
};