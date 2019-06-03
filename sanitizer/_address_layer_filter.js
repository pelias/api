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
 * 
 * Update: added warning message to inform user when this functionality is enabled
 * Update: added additional check that enforces that the input must also contain at least one numeral
 */

 // note: this runs before libpostal (which is a service)

const ADDRESS_FILTER_WARNING = 'performance optimization: excluding \'address\' layer';

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

      // default to using the full 'clean.text'
      // note: this should already have superfluous characters removed
      let input = clean.text;

      // no nothing if no input text specified in the request
      if (!check.nonEmptyString(input)) {
        return messages;
      }

      // if a parser has removed tokens, use the parsed text instead, this
      // is the text which will be queried against the 'name.default' field.
      // @todo: this logic is duplicated from 'query/text_parser.js' and may
      // be subject to change.
      if (check.nonEmptyObject(clean.parsed_text)) {

        var isStreetAddress = clean.parsed_text.hasOwnProperty('number') && clean.parsed_text.hasOwnProperty('street');

        // use $subject where available (pelias parser)
        if (_.has(clean, 'parsed_text.subject')) {
          input = clean.parsed_text.subject;
        }

        // if 'addressit' or 'libpostal' identified input as a street address
        else if (isStreetAddress) {
          input = clean.parsed_text.number + ' ' + clean.parsed_text.street;
        }

        // else if the 'naive parser' was used, input is equal to 'name'
        else if (check.nonEmptyString(clean.parsed_text.admin_parts) && check.nonEmptyString(clean.parsed_text.name)) {
          input = clean.parsed_text.name;
        }
      }

      // count the number of words specified
      let totalWords = input.split(/\s+/).filter(check.nonEmptyString).length;

      // check that at least one numeral was specified
      let hasNumeral = /\d/.test(input);

      // do not consider numeric street names, such as '26 st' in numeric check.
      if( _.has(clean, 'parsed_text.street') ){
        hasNumeral = /\d/.test(input.replace(clean.parsed_text.street, ''));
      }

      // if less than two words were specified /or no numeral is present
      // then it is safe to apply the layer filter
      if (totalWords < 2 || !hasNumeral) {

        // handle the common case where neither source nor layers were specified
        if (!check.array(clean.sources) || !check.nonEmptyArray(clean.sources)) {
          clean.layers = layers;
          messages.warnings.push(ADDRESS_FILTER_WARNING);
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
          messages.warnings.push(ADDRESS_FILTER_WARNING);
        }
      }

      return messages;
    }
  };
}

module.exports = _setup;
