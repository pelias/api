const peliasQuery = require('pelias-query');
const defaults = require('./search_defaults');
const logger = require('pelias-logger').get('api');
const _ = require('lodash');
const check = require('check-types');

//------------------------------
// general-purpose search query
//------------------------------
const venuesQuery = new peliasQuery.layout.VenuesQuery();

// scoring boost
venuesQuery.score( peliasQuery.view.focus_only_function( peliasQuery.view.phrase ) );
// --------------------------------

// non-scoring hard filters
venuesQuery.filter( peliasQuery.view.boundary_country );
venuesQuery.filter( peliasQuery.view.boundary_circle );
venuesQuery.filter( peliasQuery.view.boundary_rect );
venuesQuery.filter( peliasQuery.view.sources );
// --------------------------------

const adminLayers = ['neighbourhood', 'borough', 'city', 'county', 'state', 'country'];

/**
  map request variables to query variables for all inputs
  provided by this HTTP request.  This function operates on res.data which is the
  Document-ified placeholder repsonse.
**/
function generateQuery( clean ){
  const vs = new peliasQuery.Vars( defaults );

  const logParts = ['query:venues', 'parser:libpostal'];

  // sources
  if( !_.isEmpty(clean.sources) ) {
    vs.var( 'sources', clean.sources);
    logParts.push('param:sources');
  }

  // size
  if( clean.querySize ) {
    vs.var( 'size', clean.querySize );
    logParts.push('param:querySize');
  }

  const mostGranularLayer = adminLayers.find(layer => {
    return _.has(clean.parsed_text, layer);
  });

  if (mostGranularLayer) {
    vs.var('input:query', clean.parsed_text[mostGranularLayer]);
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
  } else if ( check.number(clean['focus.point.lat']) &&
              check.number(clean['focus.point.lon']) ){
    vs.set({
      'boundary:circle:lat': clean['focus.point.lat'],
      'boundary:circle:lon': clean['focus.point.lon']
    });

  }

  // boundary country
  if( check.string(clean['boundary.country']) ){
    vs.set({
      'boundary:country': clean['boundary.country']
    });
  }

  // format the log parts into a single coherent string
  logger.info(logParts.map(part => `[${part}]`).join(' '));

  return {
    type: 'fallback',
    body: venuesQuery.render(vs)
  };

}

module.exports = generateQuery;
