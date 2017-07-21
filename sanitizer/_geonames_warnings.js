const _ = require('lodash');

const non_admin_fields = ['number', 'street', 'query', 'category'];

function hasAnyNonAdminFields(parsed_text) {
  return !_.isEmpty(
            _.intersection(
              _.keys(parsed_text),
              non_admin_fields));
}

function _sanitize( raw, clean ){
  // error & warning messages
  const messages = { errors: [], warnings: [] };

  // bail early if analysis isn't admin-only
  if (_.isUndefined(clean.parsed_text) || hasAnyNonAdminFields(clean.parsed_text)) {
    return messages;
  }

  // the analysis is admin-only, so add errors or warnings if geonames was requested
  if (_.isEqual(clean.sources, ['geonames'])) {
    // if requested sources is only geonames, return an error
    messages.errors.push('input contains only administrative area data, ' +
      'no results will be returned when sources=geonames');

  } else if (_.includes(clean.sources, 'geonames')) {
    // if there are other sources besides geonames, return an warning
    messages.warnings.push('input contains only administrative area data, ' +
      'geonames results will not be returned');

  }

  return messages;
}

module.exports = () => ({
  sanitize: _sanitize
});
