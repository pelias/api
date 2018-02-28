const _ = require('lodash');

// matches 'ft', 'mt' on word boundary
const mountFort = /\b([fm]t)\b/g;

const transliterations = {
  'mt':     'mount',
  'ft':     'fort'
};

function transliterate(match) {
  return _.get(transliterations, match);
}

// transliterate ft/mt to fort/mount, respectively
function _sanitize(raw, clean) {
  // error & warning messages
  // this function doesn't add any error or warning messages
  const messages = { errors: [], warnings: [] };

  // only try to transliterate if there is a city in parsed_text
  if (!_.isEmpty(_.get(clean, 'parsed_text.city'))) {
    // eg input: Ft. st Louis
    // after 1.  ft  st louis
    // after 2.  fort  st louis
    // after 3.  fort st louis

    // 1.  remove '.' that could abbreviate ft and mt (makes transliteration regex easier)
    const periods_removed = _.toLower(clean.parsed_text.city).replace(/\b(mt|ft)\./g, '$1 ');

    // 2.  transliterate 'ft'->'fort', etc
    const transliterated = periods_removed.replace(mountFort, transliterate);

    // 3.  reduce whitespace sequences that can occur when removing periods down to a single space
    const whitespace_normalized = _.trimEnd(transliterated.replace(/\s+/, ' '));

    clean.parsed_text.city = whitespace_normalized;

  }

  return messages;

}

module.exports = () => ({
  sanitize: _sanitize
});
