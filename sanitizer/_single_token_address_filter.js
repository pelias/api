const _ = require('lodash');
const check = require('check-types');

/**
 * This sanitizer applies a layer filter in the case where only a single word was specified.
 * 
 * It is based on the assumption that single-word inputs should not, and need not match
 * results from the 'address' layer.
 * 
 * The rationale is that in order to specify enough information to retrieve an address the
 * user must, at minimum enter both a housenumber and a street name.
 * 
 * Note: we cannot exclude other layers such as 'venue' (eg. Starbucks) or 'street'
 * (eg. Gleimstraße) because they may have valid single-word names.
 * 
 * The address layer contains the most records by a large margin, so excluding
 * address results where they are not nessesary will provide significant
 * performance benefits.
 */

function _setup(layersBySource) {

  // generate a deduplicated list of all layers except 'address'
  let layers = Object.keys(layersBySource).reduce((l, key) => l.concat(layersBySource[key]), []);
  layers = _.uniq(layers); // dedupe
  layers = layers.filter(item => item !== 'address'); // exclude 'address'

  return {
    layers: layers,
    sanitize: function _sanitize(__, clean) {

      // error & warning messages
      let messages = { errors: [], warnings: [] };

      // no nothing if user has explicitely specified layers in the request
      if (check.array(clean.layers) && check.nonEmptyArray(clean.layers)) {
        return messages;
      }

      // no nothing if no input text specified in the request
      if (!check.nonEmptyString(clean.text)) {
        return messages;
      }

      // check that only a single word was specified
      let totalWords = clean.text.split(/\s+/).filter(check.nonEmptyString).length;
      if (totalWords < 2) {

        // handle the common case where neither source nor layers were specified
        if (!check.array(clean.sources) || !check.nonEmptyArray(clean.sources)) {
          clean.layers = layers;
        }

        // handle the case where 'sources' were explicitly specified
        else if (check.array(clean.sources)) {

          // we need to create a list of layers for the specified sources
          let sourceLayers = clean.sources.reduce((l, key) => l.concat(layersBySource[key] || []), []);
          sourceLayers = _.uniq(sourceLayers); // dedupe

          // if the sources specified do not have any addresses or if removing the
          // address layer would result in an empty list, then this is a no-op
          if (sourceLayers.length < 2 || !sourceLayers.includes('address')) {
            return messages;
          }

          // target all layers for the sources specified except 'address'
          clean.layers = sourceLayers.filter(item => item !== 'address'); // exclude 'address'
        }
      }

      return messages;
    }
  };
}

module.exports = _setup;
