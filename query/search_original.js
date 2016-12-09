'use strict';

const peliasQuery = require('pelias-query');
const defaults = require('./search_defaults');
const textParser = require('./text_parser_addressit');
const check = require('check-types');
const logger = require('pelias-logger').get('api');

var placeTypes = require('../helper/placeTypes');

// region_a is also an admin field. addressit tries to detect
// region_a, in which case we use a match query specifically for it.
// but address it doesn't know about all of them so it helps to search
// against this with the other admin parts as a fallback
var adminFields = placeTypes.concat(['region_a']);

//------------------------------
// general-purpose search query
//------------------------------
var query = new peliasQuery.layout.FilteredBooleanQuery();

// mandatory matches
query.score( peliasQuery.view.boundary_country, 'must' );
query.score( peliasQuery.view.ngrams, 'must' );

// scoring boost
query.score( peliasQuery.view.phrase );
query.score( peliasQuery.view.focus( peliasQuery.view.phrase ) );
query.score( peliasQuery.view.popularity( peliasQuery.view.phrase ) );
query.score( peliasQuery.view.population( peliasQuery.view.phrase ) );

// address components
query.score( peliasQuery.view.address('housenumber') );
query.score( peliasQuery.view.address('street') );
query.score( peliasQuery.view.address('postcode') );

// admin components
// country_a and region_a are left as matches here because the text-analyzer
// can sometimes detect them, in which case a query more specific than a
// multi_match is appropriate.
query.score( peliasQuery.view.admin('country_a') );
query.score( peliasQuery.view.admin('region_a') );
query.score( peliasQuery.view.admin_multi_match(adminFields, 'peliasAdmin') );

// non-scoring hard filters
query.filter( peliasQuery.view.boundary_circle );
query.filter( peliasQuery.view.boundary_rect );
query.filter( peliasQuery.view.sources );
query.filter( peliasQuery.view.layers );
query.filter( peliasQuery.view.categories );

// --------------------------------

/**
  map request variables to query variables for all inputs
  provided by this HTTP request.
**/
function generateQuery( clean ){

  var vs = new peliasQuery.Vars( defaults );

  let logStr = '[query:search] [parser:addressit] ';

  // input text
  vs.var( 'input:name', clean.text );

  // sources
  if( check.array(clean.sources) && clean.sources.length ) {
    vs.var( 'sources', clean.sources);
    logStr += '[param:sources] ';
  }

  // layers
  if( check.array(clean.layers) && clean.layers.length ) {
    vs.var( 'layers', clean.layers);
    logStr += '[param:layers] ';
  }

  // categories
  if (clean.categories) {
    vs.var('input:categories', clean.categories);
    logStr += '[param:categories] ';
  }

  // size
  if( clean.querySize ) {
    vs.var( 'size', clean.querySize );
    logStr += '[param:size] ';
  }

  // focus point
  if( check.number(clean['focus.point.lat']) &&
      check.number(clean['focus.point.lon']) ){
    vs.set({
      'focus:point:lat': clean['focus.point.lat'],
      'focus:point:lon': clean['focus.point.lon']
    });
    logStr += '[param:focus_point] ';
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
    logStr += '[param:boundary_rect] ';
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
    logStr += '[param:boundary_circle] ';
  }

  // boundary country
  if( check.string(clean['boundary.country']) ){
    vs.set({
      'boundary:country': clean['boundary.country']
    });
    logStr += '[param:boundary_country] ';
  }

  // run the address parser
  if( clean.parsed_text ){
    textParser( clean.parsed_text, vs );
  }

  logger.info(logStr);

  return {
    type: 'original',
    body: query.render(vs)
  };
}


module.exports = generateQuery;
