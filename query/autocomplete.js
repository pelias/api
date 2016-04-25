
var peliasQuery = require('pelias-query'),
    defaults = require('./autocomplete_defaults'),
    textParser = require('./text_parser'),
    check = require('check-types');

// additional views (these may be merged in to pelias/query at a later date)
var views = {
  ngrams_strict:              require('./view/ngrams_strict'),
  focus_selected_layers:      require('./view/focus_selected_layers'),
  ngrams_last_token_only:     require('./view/ngrams_last_token_only'),
  phrase_first_tokens_only:   require('./view/phrase_first_tokens_only'),
  pop_subquery:               require('./view/pop_subquery'),
  boost_exact_matches:        require('./view/boost_exact_matches')
};

//------------------------------
// autocomplete query
//------------------------------
var query = new peliasQuery.layout.FilteredBooleanQuery();

// mandatory matches
query.score( views.phrase_first_tokens_only, 'must' );
query.score( views.ngrams_last_token_only, 'must' );

// address components
query.score( peliasQuery.view.address('housenumber') );
query.score( peliasQuery.view.address('street') );
query.score( peliasQuery.view.address('postcode') );

// admin components
query.score( peliasQuery.view.admin('country') );
query.score( peliasQuery.view.admin('country_a') );
query.score( peliasQuery.view.admin('region') );
query.score( peliasQuery.view.admin('region_a') );
query.score( peliasQuery.view.admin('county') );
query.score( peliasQuery.view.admin('localadmin') );
query.score( peliasQuery.view.admin('locality') );
query.score( peliasQuery.view.admin('neighbourhood') );

// scoring boost
query.score( views.boost_exact_matches );
query.score( views.focus_selected_layers( views.ngrams_strict ) );
query.score( peliasQuery.view.popularity( views.pop_subquery ) );
query.score( peliasQuery.view.population( views.pop_subquery ) );

// non-scoring hard filters
query.filter( peliasQuery.view.sources );

// --------------------------------

/**
  map request variables to query variables for all inputs
  provided by this HTTP request.
**/
function generateQuery( clean ){

  var vs = new peliasQuery.Vars( defaults );

  // sources
  if( check.array(clean.sources) && clean.sources.length ){
    vs.var( 'sources', clean.sources );
  }

  // mark the name as incomplete (user has not yet typed a comma)
  vs.var( 'input:name:isComplete', false );

  // perform some operations on 'clean.text':
  // 1. if there is a space followed by a single char, remove them.
  //  - this is required as the index uses 2grams and sending 1grams
  //  - to a 2gram index when using 'type:phrase' or 'operator:and' will
  //  - result in a complete failure of the query.
  // 2. trim leading and trailing whitespace.
  // note: single digit grams are now being produced in the name.* index
  var text = clean.text.replace(/( [^0-9]$)/g,'').trim();

  // if the input parser has run and suggested a 'parsed_text.name' to use.
  if( clean.hasOwnProperty('parsed_text') && clean.parsed_text.hasOwnProperty('name') ){

    // mark the name as complete (user has already typed a comma)
    vs.var( 'input:name:isComplete', true );

    // use 'parsed_text.name' instead of 'clean.text'.
    text = clean.parsed_text.name;
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
