const peliasQuery = require('pelias-query');
const defaults = require('./autocomplete_defaults');
const textParser = require('./text_parser_addressit');
const check = require('check-types');
const logger = require('pelias-logger').get('api');
const config = require('pelias-config').generate();

// additional views (these may be merged in to pelias/query at a later date)
var views = {
  custom_boosts:              require('./view/boost_sources_and_layers'),
  ngrams_strict:              require('./view/ngrams_strict'),
  ngrams_last_token_only:     require('./view/ngrams_last_token_only'),
  phrase_first_tokens_only:   require('./view/phrase_first_tokens_only'),
  pop_subquery:               require('./view/pop_subquery'),
  boost_exact_matches:        require('./view/boost_exact_matches'),
  max_character_count_layer_filter:   require('./view/max_character_count_layer_filter'),
  focus_point_filter:         require('./view/focus_point_distance_filter')
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
query.score( peliasQuery.view.admin('borough') );
query.score( peliasQuery.view.admin('localadmin') );
query.score( peliasQuery.view.admin('locality') );
query.score( peliasQuery.view.admin('neighbourhood') );

// scoring boost
query.score( views.boost_exact_matches );
query.score( peliasQuery.view.focus( views.ngrams_strict ) );
query.score( peliasQuery.view.popularity( views.pop_subquery ) );
query.score( peliasQuery.view.population( views.pop_subquery ) );
query.score( views.custom_boosts( config.get('api.customBoosts') ) );

// non-scoring hard filters
query.filter( views.max_character_count_layer_filter(['address'], config.get('api.autocomplete.exclude_address_length' ) ) );
query.filter( peliasQuery.view.sources );
query.filter( peliasQuery.view.layers );
query.filter( peliasQuery.view.boundary_rect );
query.filter( peliasQuery.view.boundary_circle );
query.filter( peliasQuery.view.boundary_country );
query.filter( peliasQuery.view.categories );
query.filter( peliasQuery.view.boundary_gid );
query.filter( views.focus_point_filter );

// --------------------------------

/**
  map request variables to query variables for all inputs
  provided by this HTTP request.
**/
function generateQuery( clean ){

  const vs = new peliasQuery.Vars( defaults );

  // sources
  if( check.array(clean.sources) && clean.sources.length ){
    vs.var( 'sources', clean.sources );
  }

  // layers
  if( check.array(clean.layers) && clean.layers.length ){
    vs.var( 'layers', clean.layers);
  }

  // boundary country
  if( check.nonEmptyArray(clean['boundary.country']) ){
    vs.set({
      'boundary:country': clean['boundary.country'].join(' ')
    });
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

  // boundary gid
  if( check.string(clean['boundary.gid']) ){
    vs.set({
      'boundary:gid': clean['boundary.gid']
    });
  }

  // categories
  if (clean.categories && clean.categories.length) {
    vs.var('input:categories', clean.categories);
  }

  // run the address parser
  if( clean.parsed_text ){
    textParser( clean, vs );
  }

  return {
    type: 'autocomplete',
    body: query.render(vs)
  };
}

module.exports = generateQuery;
