var schema = require('pelias-schema');
var logger = require( 'pelias-logger' ).get( 'api' );

var ADMIN_FIELDS = [
  'admin0',
  'admin1',
  'admin1_abbr',
  'admin2',
  'local_admin',
  'locality',
  'neighborhood'
];

function getAvailableAdminFields() {
  var actualFields = Object.keys(schema.mappings._default_.properties);

  // check if expected fields are actually in current schema
  var available = ADMIN_FIELDS.filter(function (field) {
    return (actualFields.indexOf(field) !== -1);
  });

  if (available.length === 0) {
    logger.error('helper/adminFields: no expected admin fields found in schema');
  }

  return available;
}

module.exports.availableFields = getAvailableAdminFields();
module.exports.expectedFields = ADMIN_FIELDS;