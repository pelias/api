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

  if (text_length > 5) {
    return null;
  }

  const all_layers_except_address = _.without(type_mapping.layers, 'address');

  const query = {
    bool: {
      minimum_should_match: 1,
      should: [{
        terms: {
          layer: all_layers_except_address
        }
      },{
        geo_distance: {
          distance: `${50 * text_length}km`,
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
