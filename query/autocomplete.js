
var peliasQuery = require('pelias-query'),
    defaults = require('./defaults'),
    check = require('check-types');

//------------------------------
// autocomplete query
//------------------------------
var query = new peliasQuery.layout.FilteredBooleanQuery();

// mandatory matches
query.score( peliasQuery.view.ngrams, 'must' );

// scoring boost
query.score( peliasQuery.view.phrase );
query.score( peliasQuery.view.focus );

// --------------------------------

/**
  map request variables to query variables for all inputs
  provided by this HTTP request.
**/
function generateQuery( clean ){

  var vs = new peliasQuery.Vars( defaults );

  // input text
  vs.var( 'input:name', clean.text );

  // always 10 (not user definable due to caching)
  vs.var( 'size', 10 );

  // focus point
  if( check.number(clean['focus.point.lat']) && check.number(clean['focus.point.lon']) ){
    vs.set({
      'focus:point:lat': clean['focus.point.lat'],
      'focus:point:lon': clean['focus.point.lon']
    });
  }

  return query.render( vs );
}

module.exports = generateQuery;
