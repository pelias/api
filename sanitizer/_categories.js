var check = require('check-types');
var categoryTaxonomy = require('pelias-categories');

var WARNINGS = {
  empty: 'Categories parameter left blank, showing results from all categories.'
};

// validate inputs, convert types and apply defaults
function _sanitize (raw, clean, categories) {
  categories = categories || categoryTaxonomy;

  // error & warning messages
  var messages = { errors: [], warnings: [] };

  // it's not a required parameter, so if it's not provided just move on
  if (!raw.hasOwnProperty('categories')) {
    return messages;
  }

  // if categories string has been set
  // map input categories to valid format
  try {
    clean.categories = raw.categories.split(',')
      .map(function (cat) {
        return cat.toLowerCase().trim(); // lowercase inputs
      })
      .filter(function (cat) {
        if (check.nonEmptyString(cat) && categories.isValidCategory(cat)) {
          return true;
        }
        throw new Error('Empty string value');
      });
  } catch (err) {
    // remove everything from the list if there was any error
    messages.warnings.push(WARNINGS.empty);
    clean.categories = [];
  }

  return messages;
}

function _expected () {
  return [{ name: 'categories' }];
}
// export function
module.exports = () => ({
  sanitize: _sanitize,
  expected: _expected
});
