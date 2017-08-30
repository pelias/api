const _ = require('lodash');
const iso3166 = require('iso3166-1');

// this sanitizer exists solely to convert an ISO2 country value to ISO3
// eg - 'TH' -> 'THA'
// this can go away once altnames imports ISO2 country values from WOF
function _sanitize( raw, clean ){
  // error & warning messages
  const messages = { errors: [], warnings: [] };

  if (clean.hasOwnProperty('parsed_text') && iso3166.is2(_.toUpper(clean.parsed_text.country))) {
    clean.parsed_text.country = iso3166.to3(_.toUpper(clean.parsed_text.country));
  }

  return messages;
}

// export function
module.exports = () => ({
  sanitize: _sanitize
});
