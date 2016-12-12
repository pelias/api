const _ = require('lodash');

// matches 'ft', 'mt', 'saint', and 'sainte' on word boundary
const mountSaintFort = /\b([fm]t|sainte?)\b/g;

const translations = {
  'mt': 'mount',
  'ft': 'fort',
  'saint': 'st',
  'sainte': 'ste'
};

function translate(match) {
  return _.get(translations, match);
}

function sanitize(raw, clean) {
  // error & warning messages
  // this function doesn't add any error or warning messages
  const messages = { errors: [], warnings: [] };

  if (!_.isEmpty(_.get(clean, 'parsed_text.city'))) {
    // replace ft/mt/saint/sainte with fort/mount/st/ste, respectively
    clean.parsed_text.city = _.toLower(clean.parsed_text.city.replace(/\./g, '')).replace(mountSaintFort, translate);
  }

  return messages;

}

module.exports = sanitize;
