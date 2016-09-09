module.exports = {
  'query': {
    'function_score': {
      'query': {
        'filtered': {
          'query': {
            'bool': {
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
                          'query': 'neighbourhood value',
                          'type': 'phrase',
                          'fields': [
                            'parent.neighbourhood',
                            'parent.neighbourhood_a'
                          ]
                        }
                      },
                      {
                        'multi_match': {
                          'query': 'borough value',
                          'type': 'phrase',
                          'fields': [
                            'parent.borough',
                            'parent.borough_a'
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
                          'query': 'county value',
                          'type': 'phrase',
                          'fields': [
                            'parent.county',
                            'parent.county_a',
                            'parent.macrocounty',
                            'parent.macrocounty_a'
                          ]
                        }
                      },
                      {
                        'multi_match': {
                          'query': 'state value',
                          'type': 'phrase',
                          'fields': [
                            'parent.region',
                            'parent.region_a'
                          ]
                        }
                      },
                      {
                        'multi_match': {
                          'query': 'country value',
                          'type': 'phrase',
                          'fields': [
                            'parent.country',
                            'parent.country_a',
                            'parent.dependency',
                            'parent.dependency_a'
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
                    '_name': 'fallback.address',
                    'must': [
                      {
                        'match_phrase': {
                          'address_parts.number': 'number value'
                        }
                      },
                      {
                        'match_phrase': {
                          'address_parts.street': 'street value'
                        }
                      },
                      {
                        'multi_match': {
                          'query': 'neighbourhood value',
                          'type': 'phrase',
                          'fields': [
                            'parent.neighbourhood',
                            'parent.neighbourhood_a'
                          ]
                        }
                      },
                      {
                        'multi_match': {
                          'query': 'borough value',
                          'type': 'phrase',
                          'fields': [
                            'parent.borough',
                            'parent.borough_a'
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
                          'query': 'county value',
                          'type': 'phrase',
                          'fields': [
                            'parent.county',
                            'parent.county_a',
                            'parent.macrocounty',
                            'parent.macrocounty_a'
                          ]
                        }
                      },
                      {
                        'multi_match': {
                          'query': 'state value',
                          'type': 'phrase',
                          'fields': [
                            'parent.region',
                            'parent.region_a'
                          ]
                        }
                      },
                      {
                        'multi_match': {
                          'query': 'country value',
                          'type': 'phrase',
                          'fields': [
                            'parent.country',
                            'parent.country_a',
                            'parent.dependency',
                            'parent.dependency_a'
                          ]
                        }
                      }
                    ],
                    'filter': {
                      'term': {
                        'layer': 'address'
                      }
                    }
                  }
                },
                {
                  'bool': {
                    '_name': 'fallback.neighbourhood',
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
                      },
                      {
                        'multi_match': {
                          'query': 'borough value',
                          'type': 'phrase',
                          'fields': [
                            'parent.borough',
                            'parent.borough_a'
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
                          'query': 'county value',
                          'type': 'phrase',
                          'fields': [
                            'parent.county',
                            'parent.county_a',
                            'parent.macrocounty',
                            'parent.macrocounty_a'
                          ]
                        }
                      },
                      {
                        'multi_match': {
                          'query': 'state value',
                          'type': 'phrase',
                          'fields': [
                            'parent.region',
                            'parent.region_a'
                          ]
                        }
                      },
                      {
                        'multi_match': {
                          'query': 'country value',
                          'type': 'phrase',
                          'fields': [
                            'parent.country',
                            'parent.country_a',
                            'parent.dependency',
                            'parent.dependency_a'
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
                    '_name': 'fallback.borough',
                    'must': [
                      {
                        'multi_match': {
                          'query': 'borough value',
                          'type': 'phrase',
                          'fields': [
                            'parent.borough',
                            'parent.borough_a'
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
                          'query': 'county value',
                          'type': 'phrase',
                          'fields': [
                            'parent.county',
                            'parent.county_a',
                            'parent.macrocounty',
                            'parent.macrocounty_a'
                          ]
                        }
                      },
                      {
                        'multi_match': {
                          'query': 'state value',
                          'type': 'phrase',
                          'fields': [
                            'parent.region',
                            'parent.region_a'
                          ]
                        }
                      },
                      {
                        'multi_match': {
                          'query': 'country value',
                          'type': 'phrase',
                          'fields': [
                            'parent.country',
                            'parent.country_a',
                            'parent.dependency',
                            'parent.dependency_a'
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
                          'query': 'county value',
                          'type': 'phrase',
                          'fields': [
                            'parent.county',
                            'parent.county_a',
                            'parent.macrocounty',
                            'parent.macrocounty_a'
                          ]
                        }
                      },
                      {
                        'multi_match': {
                          'query': 'state value',
                          'type': 'phrase',
                          'fields': [
                            'parent.region',
                            'parent.region_a'
                          ]
                        }
                      },
                      {
                        'multi_match': {
                          'query': 'country value',
                          'type': 'phrase',
                          'fields': [
                            'parent.country',
                            'parent.country_a',
                            'parent.dependency',
                            'parent.dependency_a'
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
                    '_name': 'fallback.county',
                    'must': [
                      {
                        'multi_match': {
                          'query': 'county value',
                          'type': 'phrase',
                          'fields': [
                            'parent.county',
                            'parent.county_a',
                            'parent.macrocounty',
                            'parent.macrocounty_a'
                          ]
                        }
                      },
                      {
                        'multi_match': {
                          'query': 'state value',
                          'type': 'phrase',
                          'fields': [
                            'parent.region',
                            'parent.region_a'
                          ]
                        }
                      },
                      {
                        'multi_match': {
                          'query': 'country value',
                          'type': 'phrase',
                          'fields': [
                            'parent.country',
                            'parent.country_a',
                            'parent.dependency',
                            'parent.dependency_a'
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
                      },
                      {
                        'multi_match': {
                          'query': 'country value',
                          'type': 'phrase',
                          'fields': [
                            'parent.country',
                            'parent.country_a',
                            'parent.dependency',
                            'parent.dependency_a'
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
                    '_name': 'fallback.country',
                    'must': [
                      {
                        'multi_match': {
                          'query': 'country value',
                          'type': 'phrase',
                          'fields': [
                            'parent.country',
                            'parent.country_a',
                            'parent.dependency',
                            'parent.dependency_a'
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
          'filter': {
            'bool': {
              'must': []
            }
          }
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
  'size': 20,
  'track_scores': true
};
