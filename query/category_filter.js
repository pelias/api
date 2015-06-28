/**
 * Inject the logic for filtering results by category into an elasticsearch
 * query.
 */

'use strict';

module.exports = function ( query, params ){
  if( params.categories && params.categories.length > 0 ){
    query.query.filtered.filter.bool.must.push({
      terms: {
        category: params.categories
      }
    });
  }
};
