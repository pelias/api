
var generate = require('../../../query/search');
var admin_boost = 'admin_boost';
var population = 'population';
var popularity = 'popularity';
var category = 'category';
var parser = require('../../../helper/query_parser');
var category_weights = require('../../../helper/category_weights');
var admin_weights = require('../../../helper/admin_weights');
var address_weights = require('../../../helper/address_weights');
var weights = require('pelias-suggester-pipeline').weights;


module.exports.tests = {};

module.exports.tests.interface = function(test, common) {
  test('valid interface', function(t) {
    t.equal(typeof generate, 'function', 'valid function');
    t.end();
  });
};

var sort = [
  '_score',
  {
    '_script': {
      'file': admin_boost,
      'type': 'number',
      'order': 'desc'
    }
  },
  {
    '_script': {
      'file': popularity,
      'type': 'number',
      'order': 'desc'
    }
  },
  {
    '_script': {
      'file': population,
      'type': 'number',
      'order': 'desc'
    }
  },
  {
    '_script': {
      'params': {
        'weights': admin_weights
      },
      'file': 'weights',
      'type': 'number',
      'order': 'desc'
    }
  },
  {
    '_script': {
      'params': {
        'category_weights': category_weights.default
      },
      'file': category,
      'type': 'number',
      'order': 'desc'
    }
  },
  {
    '_script': {
      'params': {
        'weights': weights
      },
      'file': 'weights',
      'type': 'number',
      'order': 'desc'
    }
  }
];

var expected = {
  'query': {
    'filtered': {
      'query': {
        'bool': {
          'must': [{
            'match': {
              'name.default': {
                'query': 'test',
                'analyzer': 'peliasOneEdgeGram'
              }
            }
          }],
          'should': [{
            'match': {
              'phrase.default': {
                'query': 'test',
                'analyzer': 'peliasPhrase',
                'type': 'phrase',
                'slop': 2
              }
            }
          }]
        }
      },
      'filter': {
        'bool': {
          'must': [
            {
              'geo_bounding_box': {
                'center_point': {
                  'top': '47.47',
                  'right': '-61.84',
                  'bottom':'11.51',
                  'left': '-103.16'
                },
                '_cache': true,
                'type': 'indexed'
              }
            }
          ]
        }
      }
    }
  },
  'sort': sort,
  'size': 10,
  'track_scores': true
};

module.exports.tests.query = function(test, common) {
  test('valid query', function(t) {
    var query = generate({
      input: 'test', size: 10,
      lat: 29.49136, lon: -82.50622,
      bbox: {
        top: 47.47, 
        right: -61.84, 
        bottom: 11.51, 
        left: -103.16
      },
      layers: ['test']
    });

    t.deepEqual(query, expected, 'valid search query');
    t.end();
  });

  test('valid query without lat/lon', function(t) {
    var query = generate({
      input: 'test', size: 10,
      bbox: {
        top: 47.47, 
        right: -61.84, 
        bottom: 11.51, 
        left: -103.16
      },
      layers: ['test']
    });
    
    t.deepEqual(query, expected, 'valid search query');
    t.end();
  });

  test('valid query with no lat/lon and no bbox', function(t) {
    var query = generate({
      input: 'test', size: 10,
      layers: ['test']
    });

    var expected = {
      'query': {
        'filtered': {
          'query': {
            'bool': {
              'must': [{
                'match': {
                  'name.default': {
                    'query': 'test',
                    'analyzer': 'peliasOneEdgeGram'
                  }
                }
              }],
              'should': [{
                'match': {
                  'phrase.default': {
                    'query': 'test',
                    'analyzer': 'peliasPhrase',
                    'type': 'phrase',
                    'slop': 2
                  }
                }
              }]
            }
          },
          'filter': {
            'bool': {
              'must': []
            }
          }
        }
      },
      'size': 10,
      'sort': sort,
      'track_scores': true
    };
    
    t.deepEqual(query, expected, 'valid search query');
    t.end();
  });

  test('valid query without bbox', function(t) {
    var query = generate({
      input: 'test', size: 10,
      lat: 29.49136, lon: -82.50622,
      layers: ['test']
    });

    var expected = {
      'query': {
        'filtered': {
          'query': {
            'bool': {
              'must': [{
                'match': {
                  'name.default': {
                    'query': 'test',
                    'analyzer': 'peliasOneEdgeGram'
                  }
                }
              }],
              'should': [{
                'match': {
                  'phrase.default': {
                    'query': 'test',
                    'analyzer': 'peliasPhrase',
                    'type': 'phrase',
                    'slop': 2
                  }
                }
              }]
            }
          },
          'filter': {
            'bool': {
              'must': [
                {
                  'geo_distance': {
                    'distance': '50km',
                    'distance_type': 'plane',
                    'optimize_bbox': 'indexed',
                    '_cache': true,
                    'center_point': {
                      'lat': '29.49',
                      'lon': '-82.51'
                    }
                  }
                }
              ]
            }
          }
        }
      },
      'sort': ['_score'].concat(sort.slice(1)),
      'size': 10,
      'track_scores': true
    };

    t.deepEqual(query, expected, 'valid search query');
    t.end();
  });

  test('valid query with a full valid address', function(t) {
    var address = '123 main st new york ny 10010 US';
    var query = generate({ input: address, 
      layers: [ 'geoname', 'osmnode', 'osmway', 'admin0', 'admin1', 'admin2', 'neighborhood', 
                'locality', 'local_admin', 'osmaddress', 'openaddresses' ], 
      size: 10,
      details: true,
      parsed_input: parser.get_parsed_address(address),
      default_layers_set: true
    });

    var expected = {
     'query': {
       'filtered': {
         'query': {
           'bool': {
             'must': [
               {
                 'match': {
                   'name.default': {
                     'query': '123 main st',
                     'analyzer': 'peliasOneEdgeGram'
                   }
                 }
               }
             ],
             'should': [
               {
                 'match': {
                   'address.number': {
                     'query': 123,
                     'boost': address_weights.number
                   }
                 }
               },
               {
                 'match': {
                   'address.street': {
                     'query': 'main st',
                     'boost': address_weights.street
                   }
                 }
               },
               {
                 'match': {
                   'address.zip': {
                     'query': 10010,
                     'boost': address_weights.zip
                   }
                 }
               },
               {
                 'match': {
                   'admin1_abbr': {
                     'query': 'NY',
                     'boost': address_weights.admin1_abbr
                   }
                 }
               },
               {
                 'match': {
                   'alpha3': {
                     'query': 'USA',
                     'boost': address_weights.alpha3
                   }
                 }
               },
               {
                 match: {
                   admin0: 'new york'
                 }
               },
               {
                 match: {
                   admin1: 'new york'
                 }
               },
               {
                 match: {
                   admin2: 'new york'
                 }
               },
               {
                 match: {
                   local_admin: 'new york'
                 }
               },
               {
                 match: {
                   locality: 'new york'
                 }
               },
               {
                 match: {
                   neighborhood: 'new york'
                 }
               },
               {
                 'match': {
                   'phrase.default': {
                     'query': '123 main st',
                     'analyzer': 'peliasPhrase',
                     'type': 'phrase',
                     'slop': 2
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
     'size': 10,
     'sort': [
       '_score',
       {
         '_script': {
           'file': 'admin_boost',
           'type': 'number',
           'order': 'desc'
         }
       },
       {
         '_script': {
           'file': 'popularity',
           'type': 'number',
           'order': 'desc'
         }
       },
       {
         '_script': {
           'file': 'population',
           'type': 'number',
           'order': 'desc'
         }
       },
       {
         '_script': {
           'params': {
             'weights': {
               'admin0': 4,
               'admin1': 3,
               'admin2': 2,
               'local_admin': 1,
               'locality': 1,
               'neighborhood': 1
             }
           },
           'file': 'weights',
           'type': 'number',
           'order': 'desc'
         }
       },
       {
         '_script': {
           'params': {
             'category_weights': {
               'transport:air': 2,
               'transport:air:aerodrome': 2,
               'transport:air:airport': 2
             }
           },
           'file': 'category',
           'type': 'number',
           'order': 'desc'
         }
       },
       {
         '_script': {
           'params': {
             'weights': {
               'geoname': 0,
               'address': 4,
               'osmnode': 6,
               'osmway': 6,
               'poi-address': 8,
               'neighborhood': 10,
               'local_admin': 12,
               'locality': 12,
               'admin2': 12,
               'admin1': 14,
               'admin0': 2
             }
           },
           'file': 'weights',
           'type': 'number',
           'order': 'desc'
         }
       }
     ],
     'track_scores': true
    };
    
    t.deepEqual(query, expected, 'valid search query');
    t.end();
  });
  
  test('valid query with partial address', function(t) {
    var partial_address = 'soho grand, new york';
    var query = generate({ input: partial_address, 
      layers: [ 'geoname', 'osmnode', 'osmway', 'admin0', 'admin1', 'admin2', 'neighborhood', 
                'locality', 'local_admin', 'osmaddress', 'openaddresses' ], 
      size: 10,
      details: true,
      parsed_input: parser.get_parsed_address(partial_address),
      default_layers_set: true
    });

    var expected = {
     'query': {
       'filtered': {
         'query': {
           'bool': {
             'must': [
               {
                 'match': {
                   'name.default': {
                     'query': 'soho grand',
                     'analyzer': 'peliasOneEdgeGram'
                   }
                 }
               }
             ],
             'should': [
               {
                 'match': {
                   'admin0': 'new york'
                 }
               },
               {
                 'match': {
                   'admin1': 'new york'
                 }
               },
               {
                 'match': {
                   'admin1_abbr': 'new york'
                 }
               },
               {
                 'match': {
                   'admin2': 'new york'
                 }
               },
               {
                 'match': {
                   'local_admin': 'new york'
                 }
               },
               {
                 'match': {
                   'locality': 'new york'
                 }
               },
               {
                 'match': {
                   'neighborhood': 'new york'
                 }
               },
               {
                 'match': {
                   'phrase.default': {
                     'query': 'soho grand',
                     'analyzer': 'peliasPhrase',
                     'type': 'phrase',
                     'slop': 2
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
     'size': 10,
     'sort': [
       '_score',
       {
         '_script': {
           'file': 'admin_boost',
           'type': 'number',
           'order': 'desc'
         }
       },
       {
         '_script': {
           'file': 'popularity',
           'type': 'number',
           'order': 'desc'
         }
       },
       {
         '_script': {
           'file': 'population',
           'type': 'number',
           'order': 'desc'
         }
       },
       {
         '_script': {
           'params': {
             'weights': {
               'admin0': 4,
               'admin1': 3,
               'admin2': 2,
               'local_admin': 1,
               'locality': 1,
               'neighborhood': 1
             }
           },
           'file': 'weights',
           'type': 'number',
           'order': 'desc'
         }
       },
       {
         '_script': {
           'params': {
             'category_weights': {
               'transport:air': 2,
               'transport:air:aerodrome': 2,
               'transport:air:airport': 2,
               'admin': 2
             }
           },
           'file': 'category',
           'type': 'number',
           'order': 'desc'
         }
       },
       {
         '_script': {
           'params': {
             'weights': {
               'geoname': 0,
               'address': 4,
               'osmnode': 6,
               'osmway': 6,
               'poi-address': 8,
               'neighborhood': 10,
               'local_admin': 12,
               'locality': 12,
               'admin2': 12,
               'admin1': 14,
               'admin0': 2
             }
           },
           'file': 'weights',
           'type': 'number',
           'order': 'desc'
         }
       }
     ],
     'track_scores': true
    };

    t.deepEqual(query, expected, 'valid search query');
    t.end();
  });

  test('valid query with regions in address', function(t) {
    var partial_address = '1 water st manhattan ny';
    var query = generate({ input: partial_address,
      layers: [ 'geoname', 'osmnode', 'osmway', 'admin0', 'admin1', 'admin2', 'neighborhood',
        'locality', 'local_admin', 'osmaddress', 'openaddresses' ],
      size: 10,
      details: true,
      parsed_input: parser.get_parsed_address(partial_address),
      default_layers_set: true
    });

    var expected = {
      'query': {
        'filtered': {
          'query': {
            'bool': {
              'must': [
                {
                  'match': {
                    'name.default': {
                      'query': '1 water st',
                      'analyzer': 'peliasOneEdgeGram'
                    }
                  }
                }
              ],
              'should': [
                {
                  'match': {
                    'address.number': {
                      'query': 1,
                      'boost': address_weights.number
                    }
                  }
                },
                {
                  'match': {
                    'address.street': {
                      'query': 'water st',
                      'boost': address_weights.street
                    }
                  }
                },
                {
                  'match': {
                    'admin1_abbr': {
                      'query': 'NY',
                      'boost': address_weights.admin1_abbr
                    }
                  }
                },
                {
                  'match': {
                    'admin0': 'manhattan'
                  }
                },
                {
                  'match': {
                    'admin1': 'manhattan'
                  }
                },
                {
                  'match': {
                    'admin2': 'manhattan'
                  }
                },
                {
                  'match': {
                    'local_admin': 'manhattan'
                  }
                },
                {
                  'match': {
                    'locality': 'manhattan'
                  }
                },
                {
                  'match': {
                    'neighborhood': 'manhattan'
                  }
                },
                {
                  'match': {
                    'phrase.default': {
                      'query': '1 water st',
                      'analyzer': 'peliasPhrase',
                      'type': 'phrase',
                      'slop': 2
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
      'size': 10,
      'sort': [
        '_score',
        {
          '_script': {
            'file': 'admin_boost',
            'type': 'number',
            'order': 'desc'
          }
        },
        {
          '_script': {
            'file': 'popularity',
            'type': 'number',
            'order': 'desc'
          }
        },
        {
          '_script': {
            'file': 'population',
            'type': 'number',
            'order': 'desc'
          }
        },
        {
          '_script': {
            'params': {
              'weights': {
                'admin0': 4,
                'admin1': 3,
                'admin2': 2,
                'local_admin': 1,
                'locality': 1,
                'neighborhood': 1
              }
            },
            'file': 'weights',
            'type': 'number',
            'order': 'desc'
          }
        },
        {
          '_script': {
            'params': {
              'category_weights': {
                'transport:air': 2,
                'transport:air:aerodrome': 2,
                'transport:air:airport': 2
              }
            },
            'file': 'category',
            'type': 'number',
            'order': 'desc'
          }
        },
        {
          '_script': {
            'params': {
              'weights': {
                'geoname': 0,
                'address': 4,
                'osmnode': 6,
                'osmway': 6,
                'poi-address': 8,
                'neighborhood': 10,
                'local_admin': 12,
                'locality': 12,
                'admin2': 12,
                'admin1': 14,
                'admin0': 2
              }
            },
            'file': 'weights',
            'type': 'number',
            'order': 'desc'
          }
        }
      ],
      'track_scores': true
    };

    t.deepEqual(query, expected, 'valid search query');
    t.end();
  });

};

module.exports.all = function (tape, common) {

  function test(name, testFunction) {
    return tape('search query ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
