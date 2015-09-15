
var _ = require('lodash'),
    peliasSchema = require('pelias-schema'),
    peliasLogger = require( 'pelias-logger' ).get( 'api' );

var ADMIN_FIELDS = [
  'admin0',
  'admin1',
  'admin1_abbr',
  'admin2',
  'local_admin',
  'locality',
  'neighborhood'
];

/**
 * Get all admin fields that were expected and also found in schema
 *
 * @param {Object} [schema] optional: for testing only
 * @param {Array} [expectedFields] optional: for testing only
 * @param {Object} [logger] optional: for testing only
 * @returns {Array.<string>}
 */
function getAvailableAdminFields(schema, expectedFields, logger) {

  schema = schema || peliasSchema;
  expectedFields = expectedFields || ADMIN_FIELDS;
  logger = logger || peliasLogger;

  var actualFields = Object.keys(schema.mappings._default_.properties);

  // check if expected fields are actually in current schema
  var available = expectedFields.filter(function (field) {
    return _.contains( actualFields, field );
  });

  if (available.length === 0) {
    logger.error('helper/adminFields: no expected admin fields found in schema');
  }

  return available;
}

module.exports = getAvailableAdminFields;