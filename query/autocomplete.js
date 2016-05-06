
var peliasQuery = require('pelias-query'),
    defaults = require('./autocomplete_defaults'),
    textParser = require('./text_parser'),
    check = require('check-types'),
    viewsToQuery = require('./views_to_query'),
    _ = require('lodash');

// additional views (these may be merged in to pelias/query at a later date)
var viewLib = {
  ngrams_strict:              require('./view/ngrams_strict'),
  focus_selected_layers:      require('./view/focus_selected_layers'),
  ngrams_last_token_only:     require('./view/ngrams_last_token_only'),
  phrase_first_tokens_only:   require('./view/phrase_first_tokens_only'),
  pop_subquery:               require('./view/pop_subquery'),
  boost_exact_matches:        require('./view/boost_exact_matches')
};

// merge available views into a single library
for (var name in peliasQuery.view) {
  viewLib[name] = peliasQuery.view[name];
}

//------------------------------
// autocomplete query
//------------------------------
var query = new peliasQuery.layout.FilteredBooleanQuery();

var views;
var api = require('pelias-config').generate().api;
if (api && api.query && api.query.autocomplete) {
  // external config
  views = api.query.autocomplete.views;

  if(api.query.autocomplete.defaults) {
    defaults = _.merge({}, defaults, api.query.autocomplete.defaults);
  }
}

if (!views) {
  // Get default view configuration
  views = require( './autocomplete_views.json' );
}

// add defined views to the query
viewsToQuery(views, query, viewLib);

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

  // pass the input tokens to the views so they can choose which tokens
  // are relevant for their specific function.
  if( check.array( clean.tokens ) ){
    vs.var( 'input:name:tokens', clean.tokens );
    vs.var( 'input:name:tokens_complete', clean.tokens_complete );
    vs.var( 'input:name:tokens_incomplete', clean.tokens_incomplete );
  }

  // input text
  vs.var( 'input:name', clean.text );

  // if the tokenizer has run then we set 'input:name' to as the combination of the
  // 'complete' tokens with the 'incomplete' tokens, the resuting array differs
  // slightly from the 'input:name:tokens' array as some tokens might have been
  // removed in the process; such as single grams which are not present in then
  // ngrams index.
  if( check.array( clean.tokens_complete ) && check.array( clean.tokens_incomplete ) ){
    var combined = clean.tokens_complete.concat( clean.tokens_incomplete );
    if( combined.length ){
      vs.var( 'input:name', combined.join(' ') );
    }
  }

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
