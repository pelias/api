
var peliasQuery = require('pelias-query');

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

  var vs = new peliasQuery.Vars( peliasQuery.defaults );

  // input text
  vs.var( 'input:name', clean.text );

  // always 10 (not user definable due to caching)
  vs.var( 'size', 10 );

  // focus point
  if( clean.lat && clean.lon ){
    vs.set({
      'focus:point:lat': clean.lat,
      'focus:point:lon': clean.lon
    });
  }

  return query.render( vs );
}

module.exports = generateQuery;
