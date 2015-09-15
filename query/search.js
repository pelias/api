var peliasQuery = require('pelias-query'),
    defaults = require('./defaults'),
    textParser = require('./text_parser');

//------------------------------
// general-purpose search query
//------------------------------
var query = new peliasQuery.layout.FilteredBooleanQuery();

// mandatory matches
query.score( peliasQuery.view.boundary_country, 'must' );
query.score( peliasQuery.view.ngrams, 'must' );

// scoring boost
query.score( peliasQuery.view.phrase );
query.score( peliasQuery.view.focus );

// address components
query.score( peliasQuery.view.address('housenumber') );
query.score( peliasQuery.view.address('street') );
query.score( peliasQuery.view.address('postcode') );

// admin components
query.score( peliasQuery.view.admin('alpha3') );
query.score( peliasQuery.view.admin('admin0') );
query.score( peliasQuery.view.admin('admin1') );
query.score( peliasQuery.view.admin('admin1_abbr') );
query.score( peliasQuery.view.admin('admin2') );
query.score( peliasQuery.view.admin('local_admin') );
query.score( peliasQuery.view.admin('locality') );
query.score( peliasQuery.view.admin('neighborhood') );

// non-scoring hard filters
query.filter( peliasQuery.view.boundary_circle );
query.filter( peliasQuery.view.boundary_rect );

// groovy scripts used to handle tie-breaking
query.sort( peliasQuery.view.sort_numeric_script('admin_boost') );
query.sort( peliasQuery.view.sort_numeric_script('popularity') );
query.sort( peliasQuery.view.sort_numeric_script('population') );

// --------------------------------

/**
  map request variables to query variables for all inputs
  provided by this HTTP request.
**/
function generateQuery( clean ){

  var vs = new peliasQuery.Vars( defaults );

  // input text
  vs.var( 'input:name', clean.text );

  // size
  if( clean.size ){
    vs.var( 'size', clean.size );
  }

  // focus point
  if( clean.lat && clean.lon ){
    vs.set({
      'focus:point:lat': clean.lat,
      'focus:point:lon': clean.lon
    });
  }

  // focus viewport
  // @todo: change these to the correct request variable names
  // @todo: calculate the centroid from the viewport box
  if( clean.focus && clean.focus.viewport ){
    var vp = clean.focus.viewport;
    vs.set({
      'focus:point:lat': vp.min_lat + ( vp.max_lat - vp.min_lat ) / 2,
      'focus:point:lon': vp.min_lon + ( vp.max_lon - vp.min_lon ) / 2
    });
  }

  // boundary rect
  if( clean.bbox ){
    vs.set({
      'boundary:rect:top': clean.bbox.top,
      'boundary:rect:right': clean.bbox.right,
      'boundary:rect:bottom': clean.bbox.bottom,
      'boundary:rect:left': clean.bbox.left
    });
  }

  // boundary circle
  // @todo: change these to the correct request variable names
  if( clean.boundary && clean.boundary.circle ){
    vs.set({
      'boundary:circle:lat': clean.boundary.circle.lat,
      'boundary:circle:lon': clean.boundary.circle.lon,
      'boundary:circle:radius': clean.boundary.circle.radius + 'm'
    });
  }

  // boundary country
  if( clean.boundary && clean.boundary.country ){
    vs.set({
      'boundary:country': clean.boundary.country
    });
  }

  // run the address parser
  if( clean.parsed_text ){
    textParser( clean.parsed_text, vs );
  }

  return query.render( vs );
}

module.exports = generateQuery;
