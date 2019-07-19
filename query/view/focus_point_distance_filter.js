const _ = require('lodash');

const config = require('pelias-config');
const type_mapping = require('../../helper/type_mapping');

module.exports = function( vs ) {

  if ( !vs.isset('input:name') ||
       !vs.isset('centroid:field') ||
       !vs.isset('focus:point:lat') ||
       !vs.isset('focus:point:lon') ) {
    return null;
  }

  const text_length = vs.var('input:name').get().length;

  if (text_length > 8) {
    return null;
  }

  const all_layers_except_address_and_street = _.without(type_mapping.layers, 'address', 'street');

  const length_to_distance_mapping = {
    1: '100km',
    2: '200km',
    3: '400km',
    4: '600km',
    5: '900km',
    6: '1200km',
    7: '1600km',
    8: '2000km'
  };

  const query = {
    bool: {
      minimum_should_match: 1,
      should: [{
        terms: {
          layer: all_layers_except_address_and_street
        }
      },{
        geo_distance: {
          distance: length_to_distance_mapping[text_length],
          distance_type: 'plane',
          [vs.var('centroid:field')]: {
            lat: vs.var('focus:point:lat'),
            lon: vs.var('focus:point:lon')
          }
        }
      }]
    }
  };

  return query;
};
