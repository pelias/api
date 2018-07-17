//example input
//{
//  "source": {
//    "openstreetmap": 5
//  },
//  "layer": {
//    "street": 3,
//    "country": 5
//  }
//}

function generateTermQuery(field, value, boost) {
  return {
    constant_score: {
      boost: boost,
      query: {
        term: {
          [field]: value,
        }
      }
    }
  };
}

module.exports = function( configuration ) {
  return function( ) {
    const filters = [];
    ['source', 'layer'].forEach(function(target) {
      if (configuration[target]) {
        Object.keys(configuration[target]).forEach(function(item) {
          filters.push(generateTermQuery(target, item, configuration[target][item]));
        });
      }
    });

    if (filters.length === 0) {
      return null;
    } else if (filters.length === 1) {
      return filters[0];
    } else {
      return {
        bool: {
          should: filters
        }
      };
    }
  };
};
