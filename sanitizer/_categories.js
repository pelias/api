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
  clean.categories = raw.categories.split(',')
    .map(cat => {
      return cat.toLowerCase().trim(); // lowercase inputs
    })
    .filter(cat => {
      if (check.nonEmptyString(cat) && categories.isValidCategory(cat)) {
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

function _expected () {
  return [{ name: 'categories' }];
}
// export function
module.exports = () => ({
  sanitize: _sanitize,
  expected: _expected
});
