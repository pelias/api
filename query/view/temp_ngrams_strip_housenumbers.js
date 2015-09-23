
/**
  This is (should be!) only a temporary solution.

  It is intended to strip housenumbers from input text BUT
  should only apply to the ngrams analysis and not affect
  the other textual analysis.
  eg: 'phrase' matching should still include the housenumber

  This file can go away once the peliasOneEdgeGram and peliasTwoEdgeGram
  analysers have been modified in pelias/schema, but as would require
  a full re-index and (potentially) break backwards compatibily with the
  v0 legacy codebase it, unfortunately, has to wait until that legacy
  service has been fully decomissioned.
**/

var _ = require('lodash'),
    peliasQuery = require('pelias-query'),
    stopWords = require('pelias-schema/street_suffix').terms;

module.exports = function( vs ){

  // clone the $vs so we can modify this copy without
  // mutating the 'actual' query variables which get shared
  // with the other views.
  var vsClone = new peliasQuery.Vars( vs.export() );

  // set 'input:name' to the result of removeHouseNumber($name);
  if( vsClone.isset('input:name') ){
    var nameVar = vsClone.var('input:name');
    nameVar.set( removeHouseNumber( nameVar.get() ) );
  }

  // run the original ngram view but with the modified input:name' var
  return peliasQuery.view.ngrams( vsClone );
};

// remove the housenumber
// be careful of numeric street names such as '1st street'
function removeHouseNumber( name ){

  // most of the time this is sufficient
  var stripped = name.replace(/(\d+\s)/g, '').trim();

  // in this case we need to avoid stripping ALL the numbers and leaving only stop words
  // because in this case the analyser will return in a blank input string.
  // eg. the same issue exists for 'avenue street' (not covered here).
  // if this happens we simply return the original name
  if( !stripped || _.contains( stopWords, stripped.toLowerCase() ) ){
    return name;
  }

  return stripped;
}

// export for testing
module.exports.removeHouseNumber = removeHouseNumber;