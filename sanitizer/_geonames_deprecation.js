const _ = require('lodash');

/**
 * Now that we have the pip-service, we have stopped supporting returning Geonames for coarse reverse.
 *
 * However, until the `/nearby` endpoint is finalized, we still want to support Geonames for
 * _non-coarse_ reverse.
**/

const coarse_reverse_message ='coarse /reverse does not support geonames. See https://github.com/pelias/pelias/issues/675 for more info';

function _sanitize( raw, clean, opts ) {
  // error & warning messages
  const messages = { errors: [], warnings: [] };

  // return taking no action unless this is a coarse-only reverse request
  const non_coarse_layers = ['address', 'street', 'venue'];
  const is_coarse_reverse = !_.isEmpty(clean.layers) &&
          _.isEmpty(_.intersection(clean.layers, non_coarse_layers));
  if (!is_coarse_reverse) {
    return messages;
  }

  if (_.isEqual(clean.sources, ['geonames']) || _.isEqual(clean.sources, ['gn'])) {
    messages.errors.push(coarse_reverse_message);

  } else if (_.includes(clean.sources, 'geonames') || _.includes(clean.sources, 'gn')) {
    clean.sources = _.without(clean.sources, 'geonames', 'gn');
    messages.warnings.push(coarse_reverse_message);
  }

  return messages;

}

module.exports = () => ({
  sanitize: _sanitize
});
