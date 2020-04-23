const _ = require('lodash');
const allValidValidator = { isValidCategory: () => true };

const WARNINGS = {
  empty: 'Categories parameter left blank, showing results from all categories.',
  notEmpty: 'Categories filtering not supported on this endpoint, showing results from all categories.'
};

// validate inputs, convert types and apply defaults
function _sanitize (raw, clean, validator) {
  validator = validator || allValidValidator;

  // error & warning messages
  var messages = { errors: [], warnings: [] };

  // it's not a required parameter, so if it's not provided just move on
  if (!raw.hasOwnProperty('categories')) {
    return messages;
  }

  // if categories string has been set
  // map input categories to valid format
  clean.categories = raw.categories.split(',')
    .map(cat => {
      return cat.toLowerCase().trim(); // lowercase inputs
    })
    .filter(cat => {
      if (_.isString(cat) && !_.isEmpty(cat) && validator.isValidCategory(cat)) {
        return true;
      }
      return false;
    });

  if( !clean.categories.length ){
    // display a warning that the input was empty
    messages.warnings.push(WARNINGS.empty);
  }

  return messages;
}

function _alwaysBlank (raw, clean, categories) {
  // error & warning messages
  const messages = { errors: [], warnings: [] };

  if (raw.hasOwnProperty('categories')) {
    clean.categories = [];
    if (_.isString(raw.categories) && !_.isEmpty(raw.categories)) {
      messages.warnings.push(WARNINGS.notEmpty);
    }
  }

  return messages;
}

function _expected () {
  return [{ name: 'categories' }];
}
// export function
module.exports = (alwaysBlank) => ({
  sanitize: alwaysBlank ? _alwaysBlank : _sanitize,
  expected: _expected
});
