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
                        'parent.region_a',
                        'parent.macroregion',
                        'parent.macroregion_a'
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
                'boost': 10,
                'must': [
                  {
                    'match_phrase': {
                      'address_parts.number': {
                        'query': 'number value'
                      }
                    }
                  },
                  {
                    'match_phrase': {
                      'address_parts.street': {
                        'query': 'street value',
                        'analyzer': 'peliasQuery',
                        'slop': 1
                      }
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
                        'parent.region_a',
                        'parent.macroregion',
                        'parent.macroregion_a'
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
                'should': [
                  {
                    'match_phrase': {
                      'address_parts.zip': {
                        'query': 'postalcode value'
                      }
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
                '_name': 'fallback.postalcode',
                'must': [
                  {
                    'multi_match': {
                      'query': 'postalcode value',
                      'type': 'phrase',
                      'fields': [
                        'parent.postalcode'
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
                        'parent.region_a',
                        'parent.macroregion',
                        'parent.macroregion_a'
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
                    'layer': 'postalcode'
                  }
                }
              }
            },
            {
              'bool': {
                '_name': 'fallback.street',
                'boost': 5,
                'must': [
                  {
                    'match_phrase': {
                      'address_parts.street': {
                        'query': 'street value',
                        'analyzer': 'peliasQuery',
                        'slop': 1
                      }
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
                        'parent.region_a',
                        'parent.macroregion',
                        'parent.macroregion_a'
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
                'should': [
                  {
                    'match_phrase': {
                      'address_parts.zip': {
                        'query': 'postalcode value'
                      }
                    }
                  }
                ],
                'filter': {
                  'term': {
                    'layer': 'street'
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
                        'parent.region_a',
                        'parent.macroregion',
                        'parent.macroregion_a'
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
                        'parent.region_a',
                        'parent.macroregion',
                        'parent.macroregion_a'
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
                        'parent.region_a',
                        'parent.macroregion',
                        'parent.macroregion_a'
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
                        'parent.region_a',
                        'parent.macroregion',
                        'parent.macroregion_a'
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
                    'layer': 'localadmin'
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
                        'parent.county_a'
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
                '_name': 'fallback.macrocounty',
                'must': [
                  {
                    'multi_match': {
                      'query': 'county value',
                      'type': 'phrase',
                      'fields': [
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
                        'parent.region_a',
                        'parent.macroregion',
                        'parent.macroregion_a'
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
                    'layer': 'macrocounty'
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
                    'layer': 'macroregion'
                  }
                }
              }
            },
            {
              'bool': {
                '_name': 'fallback.dependency',
                'must': [
                  {
                    'multi_match': {
                      'query': 'country value',
                      'type': 'phrase',
                      'fields': [
                        'parent.dependency',
                        'parent.dependency_a'
                      ]
                    }
                  }
                ],
                'filter': {
                  'term': {
                    'layer': 'dependency'
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
  'track_scores': true,
  'sort': [
    '_score'
  ]
};
