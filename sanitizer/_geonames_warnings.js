const _ = require('lodash');

function isAdminOnly(parsed_text) {
  return ['number', 'street', 'query', 'category'].every((prop) => {
    return _.isEmpty(parsed_text[prop]);
  });
}

function sanitize( raw, clean ){
  // error & warning messages
  const messages = { errors: [], warnings: [] };

  // bail early if analysis wasn't admin-only
  if (!isAdminOnly(clean.parsed_text)) {
    return messages;
  }

  if (_.isEqual(clean.sources, ['geonames'])) {
    // if requested sources is only geonames, return an error
    messages.errors.push('input contains only administrative area data, ' +
      'no results will be returned when sources=geonames');

  } else if (_.indexOf(clean.sources, 'geonames') !== -1) {
    // if there are other sources besides geonames, return an warning
    messages.warnings.push('input contains only administrative area data, ' +
      'geonames results will not be returned');

  }

  return messages;
}

module.exports = sanitize;
