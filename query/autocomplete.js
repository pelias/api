
var peliasQuery = require('pelias-query'),
    defaults = require('./autocomplete_defaults'),
    textParser = require('./text_parser'),
    check = require('check-types');

var ngrams = function( vs ){
  var view = peliasQuery.view.ngrams( vs );
  view.match['name.default'].type = 'phrase';
  view.match['name.default'].operator = 'and';
  // console.log( JSON.stringify( view, null, 2 ) );
  return view;
};

var ngrams_last_only = function( vs ){

  // hack to disable ngrams when query parsing enabled
  if( vs.var('parsed_text').get() ){
    return null;
  }

  var name = vs.var('input:name').get();

  var vs2 = new peliasQuery.Vars( vs.export() );
  vs2.var('input:name').set( name.substr( name.lastIndexOf(' ')+1 ) );

  var view = ngrams( vs2 );
  view.match['name.default'].analyzer = 'standard';

  return view;
};

var phrase = function( vs ){
  var view = peliasQuery.view.phrase( vs );
  view.match['phrase.default'].type = 'phrase';
  // console.log( JSON.stringify( view, null, 2 ) );
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
    return phrase( vs2 );
  }

  return phrase( vs );
};

var simpleNgramsView = function( vs ){

  var view = ngrams( vs );

  view.match['name.default'].analyzer = 'peliasPhrase';
  delete view.match['name.default'].type;
  delete view.match['name.default'].boost;

  // console.log( JSON.stringify( view, null, 2 ) );
  return view;
};

var focus = peliasQuery.view.focus( ngrams );
var localView = function( vs ){

  var view = focus( vs );

  if( view && view.hasOwnProperty('function_score') ){
    view.function_score.query.match['name.default'].analyzer = 'peliasPhrase';
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
// query.score( phrase );

// console.log( focus );
query.score( localView );

query.score( peliasQuery.view.popularity( simpleNgramsView ) );
query.score( peliasQuery.view.population( simpleNgramsView ) );

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

  // always 10 (not user definable due to caching)
  vs.var( 'size', 10 );

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
