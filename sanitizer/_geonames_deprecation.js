const _ = require('lodash');

/**
with the release of coarse reverse as a separate thing and ES reverse only
handling venues, addresses, and streets, geonames make no sense in the reverse context
**/

function _sanitize( raw, clean, opts ) {
  // error & warning messages
  const messages = { errors: [], warnings: [] };

  if (_.isEqual(clean.sources, ['geonames']) || _.isEqual(clean.sources, ['gn'])) {
    messages.errors.push('/reverse does not support geonames');

  } else if (_.includes(clean.sources, 'geonames') || _.includes(clean.sources, 'gn')) {
    clean.sources = _.without(clean.sources, 'geonames', 'gn');
    messages.warnings.push('/reverse does not support geonames');

  }

  return messages;

}

module.exports = () => ({
  sanitize: _sanitize
});
