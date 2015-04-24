/**
 * Configurable weights that influence how, for a query with an admin value
 * present, a match on any given admin value affects a document's overall
 * score.
 */

module.exports = {
  admin0: 20,
  alpha3: 20,
  admin1: 10,
  admin1_abbr: 10,
  admin2: 5,
  locality: 1,
  local_admin: 1
};
