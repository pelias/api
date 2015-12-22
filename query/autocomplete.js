
var peliasQuery = require('pelias-query'),
    defaults = require('./autocomplete_defaults'),
    textParser = require('./text_parser'),
    check = require('check-types');

// additional views (these may be merged in to pelias/query at a later date)
var views = {};
views.ngrams_strict = require('./view/ngrams_strict');

var ngrams_last_only = function( vs ){

  // hack to disable ngrams when query parsing enabled
  if( vs.var('parsed_text').get() ){
    return null;
  }

  var name = vs.var('input:name').get();

  var vs2 = new peliasQuery.Vars( vs.export() );
  vs2.var('input:name').set( name.substr( name.lastIndexOf(' ')+1 ) );

  var view = views.ngrams_strict( vs2 );
  view.match['name.default'].analyzer = 'peliasPhrase';

  return view;
};

var phrase_first_only = function( vs ){

  // hack to disable substr when query parsing enabled
  if( !vs.var('parsed_text').get() ){

    var name = vs.var('input:name').get();
    var s = name.split(' ');

    // single token only, abort
    if( s.length < 2 ){
      return null;
    }

    var vs2 = new peliasQuery.Vars( vs.export() );
    vs2.var('input:name').set( name.substr(0, name.lastIndexOf(' ') ) );
    return peliasQuery.view.phrase( vs2 );
  }

  return peliasQuery.view.phrase( vs );
};

var focus = peliasQuery.view.focus( views.ngrams_strict );
var localView = function( vs ){

  var view = focus( vs );

  if( view && view.hasOwnProperty('function_score') ){
    view.function_score.filter = {
      'or': [
        { 'type': { 'value': 'osmnode' } },
        { 'type': { 'value': 'osmway' } },
        { 'type': { 'value': 'osmaddress' } },
        { 'type': { 'value': 'openaddresses' } }
      ]
    };
  }

  // console.log( JSON.stringify( view, null, 2 ) );
  return view;
};

//------------------------------
// autocomplete query
//------------------------------
var query = new peliasQuery.layout.FilteredBooleanQuery();

// mandatory matches
query.score( phrase_first_only, 'must' );
query.score( ngrams_last_only, 'must' );

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

// scoring boost
query.score( localView );

query.score( peliasQuery.view.popularity( views.ngrams_strict ) );
query.score( peliasQuery.view.population( views.ngrams_strict ) );

// --------------------------------

/**
  map request variables to query variables for all inputs
  provided by this HTTP request.
**/
function generateQuery( clean ){

  var vs = new peliasQuery.Vars( defaults );
  vs.var( 'parsed_text', false );

  // remove single grams at end
  var text = clean.text.replace(/( .$)/g,'').trim();

  if( clean.hasOwnProperty('parsed_text') ){
    if( clean.parsed_text.hasOwnProperty('name') ){
      vs.var( 'parsed_text', true );
      text = clean.parsed_text.name;
    }
  }

  // input text
  vs.var( 'input:name', text );

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

  return query.render( vs );
}

module.exports = generateQuery;
