
var peliasQuery = require('pelias-query'),
    defaults = require('./autocomplete_defaults'),
    textParser = require('./text_parser'),
    check = require('check-types');


//------------------------------
// autocomplete query
//------------------------------
var query = new peliasQuery.layout.FilteredBooleanQuery();

// mandatory matches
query.score( peliasQuery.view.ngrams, 'must' );

// admin components
query.score( peliasQuery.view.admin('alpha3') );
query.score( peliasQuery.view.admin('admin0') );
query.score( peliasQuery.view.admin('admin1') );
query.score( peliasQuery.view.admin('admin1_abbr') );
query.score( peliasQuery.view.admin('admin2') );
query.score( peliasQuery.view.admin('local_admin') );
query.score( peliasQuery.view.admin('locality') );
query.score( peliasQuery.view.admin('neighborhood') );

// scoring boost
query.score( peliasQuery.view.phrase );

var focus = peliasQuery.view.focus( peliasQuery.view.phrase );

var _tmpview = function( vs ){

  var view = focus( vs );

  if( view && view.hasOwnProperty('function_score') ){
    view.function_score.filter = {
      'or': [
        { 'type': { 'value': 'osmnode' } },
        { 'type': { 'value': 'osmway' } },
        { 'type': { 'value': 'osmaddress' } },
        { 'type': { 'value': 'openaddresses' } },
        { 'type': { 'value': 'geoname' } },
      ]
    };
  }

  // console.log( JSON.stringify( view, null, 2 ) );
  return view;
};

// console.log( focus );

query.score( _tmpview );
query.score( peliasQuery.view.popularity( peliasQuery.view.phrase ) );
query.score( peliasQuery.view.population( peliasQuery.view.phrase ) );

// --------------------------------

/**
  map request variables to query variables for all inputs
  provided by this HTTP request.
**/
function generateQuery( clean ){

  var vs = new peliasQuery.Vars( defaults );

  // input text
  vs.var( 'input:name', clean.text );

  // focus point
  if( check.number(clean['focus.point.lat']) &&
      check.number(clean['focus.point.lon']) ){
    vs.set({
      'focus:point:lat': clean['focus.point.lat'],
      'focus:point:lon': clean['focus.point.lon']
    });
  }

  // run the address parser
  if( clean.parsed_text ){
    textParser( clean.parsed_text, vs );
  }

  var q = query.render( vs );

  console.log( JSON.stringify( q, null, 2 ) );

  return q;
}

module.exports = generateQuery;
