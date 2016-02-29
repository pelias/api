
var peliasQuery = require('pelias-query'),
    defaults = require('./autocomplete_defaults'),
    textParser = require('./text_parser'),
    viewsToQuery = require('./views_to_query'),
    check = require('check-types');

//------------------------------
// autocomplete query
//------------------------------
var query = new peliasQuery.layout.FilteredBooleanQuery();

// additional views (these may be merged in to pelias/query at a later date)
var viewLib = {
  ngrams_strict:              require('./view/ngrams_strict'),
  focus_selected_layers:      require('./view/focus_selected_layers'),
  ngrams_last_token_only:     require('./view/ngrams_last_token_only'),
  phrase_first_tokens_only:   require('./view/phrase_first_tokens_only')
};

// merge available views into a single library
for (var name in peliasQuery.view) {
  viewLib[name] = peliasQuery.view[name];
}

var views;
var query_settings = require('pelias-config').generate().query;
if (query_settings && query_settings.autocomplete && query_settings.autocomplete.views) {
  // external config
  views = query_settings.autocomplete.views;
} else {
  // Get default view configuration
  views = require( './autocomplete_views.json' );
}

// add defined views to the query
viewsToQuery(views, query, viewLib);

/**
  map request variables to query variables for all inputs
  provided by this HTTP request.
**/
function generateQuery( clean ){

  var vs = new peliasQuery.Vars( defaults );

  // mark the name as incomplete (user has not yet typed a comma)
  vs.var( 'input:name:isComplete', false );

  // perform some operations on 'clean.text':
  // 1. if there is a space followed by a single char, remove them.
  //  - this is required as the index uses 2grams and sending 1grams
  //  - to a 2gram index when using 'type:phrase' or 'operator:and' will
  //  - result in a complete failure of the query.
  // 2. trim leading and trailing whitespace.
  var text = clean.text.replace(/( .$)/g,'').trim();

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
