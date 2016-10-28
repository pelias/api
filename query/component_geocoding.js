var peliasQuery = require('pelias-query'),
    defaults = require('./search_defaults'),
    textParser = require('./text_parser'),
    check = require('check-types');

//------------------------------
// general-purpose search query
//------------------------------
var componentQuery = new peliasQuery.layout.ComponentFallbackQuery();

// scoring boost
componentQuery.score( peliasQuery.view.focus_only_function( peliasQuery.view.phrase ) );
componentQuery.score( peliasQuery.view.popularity_only_function );
componentQuery.score( peliasQuery.view.population_only_function );
// --------------------------------

// non-scoring hard filters
componentQuery.filter( peliasQuery.view.boundary_country );
componentQuery.filter( peliasQuery.view.boundary_circle );
componentQuery.filter( peliasQuery.view.boundary_rect );
componentQuery.filter( peliasQuery.view.sources );
componentQuery.filter( peliasQuery.view.layers );
componentQuery.filter( peliasQuery.view.categories );
// --------------------------------

/**
  map request variables to query variables for all inputs
  provided by this HTTP request.
**/
function generateQuery( clean ){

  var vs = new peliasQuery.Vars( defaults );

  // input text
  vs.var( 'input:name', clean.text );

  // sources
  vs.var( 'sources', clean.sources);

  // layers
  vs.var( 'layers', clean.layers);

  // categories
  if (clean.categories) {
    vs.var('input:categories', clean.categories);
  }

  // size
  if( clean.querySize ) {
    vs.var( 'size', clean.querySize );
  }

  // focus point
  if( check.number(clean['focus.point.lat']) &&
      check.number(clean['focus.point.lon']) ){
    vs.set({
      'focus:point:lat': clean['focus.point.lat'],
      'focus:point:lon': clean['focus.point.lon']
    });
  }

  // boundary rect
  if( check.number(clean['boundary.rect.min_lat']) &&
      check.number(clean['boundary.rect.max_lat']) &&
      check.number(clean['boundary.rect.min_lon']) &&
      check.number(clean['boundary.rect.max_lon']) ){
    vs.set({
      'boundary:rect:top': clean['boundary.rect.max_lat'],
      'boundary:rect:right': clean['boundary.rect.max_lon'],
      'boundary:rect:bottom': clean['boundary.rect.min_lat'],
      'boundary:rect:left': clean['boundary.rect.min_lon']
    });
  }

  // boundary circle
  // @todo: change these to the correct request variable names
  if( check.number(clean['boundary.circle.lat']) &&
      check.number(clean['boundary.circle.lon']) ){
    vs.set({
      'boundary:circle:lat': clean['boundary.circle.lat'],
      'boundary:circle:lon': clean['boundary.circle.lon']
    });

    if( check.number(clean['boundary.circle.radius']) ){
      vs.set({
        'boundary:circle:radius': Math.round( clean['boundary.circle.radius'] ) + 'km'
      });
    }
  }

  // boundary country
  if( check.string(clean['boundary.country']) ){
    vs.set({
      'boundary:country': clean['boundary.country']
    });
  }

  // run the address parser
  if( clean.parsed_text ){
    textParser( clean.parsed_text, vs );
  }

  var q = getQuery(vs);

  // console.log(JSON.stringify(q.body, null, 2));

  return q;
}

function getQuery(vs) {
  return {
    type: 'fallback',
    body: componentQuery.render(vs)
  };
}

module.exports = generateQuery;
