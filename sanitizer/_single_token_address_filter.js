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

function _setup(layerMapping) {

  // generate a deduplicated list of all layers except 'address'
  let layers = Object.keys(layerMapping).reduce((l, key) => l.concat(layerMapping[key]), []);
  layers = layers.filter((layer, pos) => layers.indexOf(layer) === pos); // dedupe
  layers = layers.filter(item => item !== 'address'); // exclude 'address'

  return {
    layers: layers,
    sanitize: function _sanitize(_, clean) {
      
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
        clean.layers = layers;
      }

      return messages;
    }
  };
}

module.exports = _setup;
