
var peliasQuery = require('pelias-query'),
    check = require('check-types');

/**
  Population / Popularity subquery

  In prior versions we have had restricted the population/popularity boost
  to only a section of the query results.

  Currently it is configured to `match_all`, ie. targets all records.
**/

module.exports = function( vs ){
  return { 'match_all': {} };
};
