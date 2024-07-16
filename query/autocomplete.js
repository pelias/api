const _ = require('lodash');
const peliasQuery = require('pelias-query');
const defaults = require('./autocomplete_defaults');
const textParser = require('./text_parser_pelias');
const config = require('pelias-config').generate();
const placeTypes = require('../helper/placeTypes');
const toSingleField = require('./view/helper').toSingleField;

// additional views (these may be merged in to pelias/query at a later date)
var views = {
  custom_boosts:              require('./view/boost_sources_and_layers'),
  ngrams_strict:              require('./view/ngrams_strict'),
  ngrams_last_token_only:     require('./view/ngrams_last_token_only'),
  ngrams_last_token_only_multi: require('./view/ngrams_last_token_only_multi'),
  admin_multi_match_first: require('./view/admin_multi_match_first'),
  admin_multi_match_last: require('./view/admin_multi_match_last'),
  phrase_first_tokens_only:   require('./view/phrase_first_tokens_only'),
  boost_exact_matches:        require('./view/boost_exact_matches'),
  max_character_count_layer_filter:   require('./view/max_character_count_layer_filter'),
  focus_point_filter:         require('./view/focus_point_distance_filter'),
  focus_multi_match:          require('./view/focus_multi_match')
};

// add abbrevations for the fields pelias/parser is able to detect.
var adminFields = placeTypes.concat(['locality_a', 'region_a', 'country_a']);

// add some name field(s) to the admin fields in order to improve venue matching
// note: this is a bit of a hacky way to add a 'name' field to the list
// of multimatch fields normally reserved for admin subquerying.
// in some cases we are not sure if certain tokens refer to admin components
// or are part of the place name (such as some venue names).
// the variable name 'add_name_to_multimatch' is arbitrary, it can be any value so
// long as there is a corresponding 'admin:*:field' variable set which defines
// the name of the field to use.
// this functionality is not enabled unless the 'input:add_name_to_multimatch'
// variable is set to a non-empty value at query-time.
adminFields = adminFields.concat(['add_name_to_multimatch', 'add_name_lang_to_multimatch']);

//------------------------------
// autocomplete query
//------------------------------
var query = new peliasQuery.layout.FilteredBooleanQuery();

// mandatory matches
query.score( views.phrase_first_tokens_only, 'must' );
query.score( views.ngrams_last_token_only_multi( adminFields ), 'must' );

// admin components
query.score( views.admin_multi_match_first( adminFields ), 'must');
query.score( views.admin_multi_match_last( adminFields ), 'must');

// scoring boost
query.score( peliasQuery.view.focus( peliasQuery.view.leaf.match_all ) );
query.score( peliasQuery.view.popularity( peliasQuery.view.leaf.match_all ) );
query.score( peliasQuery.view.population( peliasQuery.view.leaf.match_all ) );
query.score( views.focus_multi_match('focus_country') );
query.score( views.focus_multi_match('focus_gid') );
query.score( views.custom_boosts( config.get('api.customBoosts') ) );

// non-scoring hard filters
query.filter( views.max_character_count_layer_filter(['address'], config.get('api.autocomplete.exclude_address_length' ) ) );
query.filter( peliasQuery.view.sources );
query.filter( peliasQuery.view.layers );
query.filter( peliasQuery.view.boundary_rect );
query.filter( peliasQuery.view.boundary_circle );
query.filter( peliasQuery.view.leaf.multi_match('boundary_country') );
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
  if( _.isArray(clean.sources) && !_.isEmpty(clean.sources) ){
    vs.var( 'sources', clean.sources );
  }

  // layers
  if (_.isArray(clean.layers) && !_.isEmpty(clean.layers) ){
    vs.var( 'layers', clean.layers);
  }

  // boundary country
  if( _.isArray(clean['boundary.country']) && !_.isEmpty(clean['boundary.country']) ){
    vs.set({
      'multi_match:boundary_country:input': clean['boundary.country'].join(' ')
    });
  }

  // focus country
  if( _.isArray(clean['focus.country']) && !_.isEmpty(clean['focus.country']) ){
    vs.set({
      'multi_match:focus_country:input': clean['focus.country'].join(' ')
    });
  }

  // focus gid
  if( _.isString(clean['focus.gid']) && !_.isEmpty(clean['focus.gid']) ){
    vs.set({
      'multi_match:focus_gid:input': clean['focus.gid']
    });
  }

  // pass the input tokens to the views so they can choose which tokens
  // are relevant for their specific function.
  if( _.isArray( clean.tokens ) ){
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
  if( _.isArray( clean.tokens_complete ) && _.isArray( clean.tokens_incomplete ) ){
    var combined = clean.tokens_complete.concat( clean.tokens_incomplete );
    if( combined.length ){
      vs.var( 'input:name', combined.join(' ') );
    }
  }

  // focus point
  if( _.isFinite(clean['focus.point.lat']) &&
      _.isFinite(clean['focus.point.lon']) ){
    vs.set({
      'focus:point:lat': clean['focus.point.lat'],
      'focus:point:lon': clean['focus.point.lon']
    });
  }

  // boundary rect
  if( _.isFinite(clean['boundary.rect.min_lat']) &&
      _.isFinite(clean['boundary.rect.max_lat']) &&
      _.isFinite(clean['boundary.rect.min_lon']) &&
      _.isFinite(clean['boundary.rect.max_lon']) ){
    vs.set({
      'boundary:rect:top': clean['boundary.rect.max_lat'],
      'boundary:rect:right': clean['boundary.rect.max_lon'],
      'boundary:rect:bottom': clean['boundary.rect.min_lat'],
      'boundary:rect:left': clean['boundary.rect.min_lon']
    });
  }

  // boundary circle
  // @todo: change these to the correct request variable names
  if( _.isFinite(clean['boundary.circle.lat']) &&
      _.isFinite(clean['boundary.circle.lon']) ){
    vs.set({
      'boundary:circle:lat': clean['boundary.circle.lat'],
      'boundary:circle:lon': clean['boundary.circle.lon']
    });

    if( _.isFinite(clean['boundary.circle.radius']) ){
      vs.set({
        'boundary:circle:radius': Math.round( clean['boundary.circle.radius'] ) + 'km'
      });
    }
  }

  // boundary gid
  if( _.isString(clean['boundary.gid']) ){
    vs.set({
      'boundary:gid': clean['boundary.gid']
    });
  }

  // categories
  if (clean.categories && clean.categories.length) {
    vs.var('input:categories', clean.categories);
  }

  // size
  if( clean.querySize ) {
    vs.var( 'size', clean.querySize );
  }

  // run the address parser
  if( clean.parsed_text ){
    textParser( clean, vs );
  }

  // set the 'add_name_to_multimatch' variable only in the case where one
  // or more of the admin variables are set.
  // the value 'enabled' is not relevant, it just needs to be any non-empty
  // value so that the associated field is added to the multimatch query.
  // see code comments above for additional information.
  let isAdminSet = adminFields.some(field => vs.isset('input:' + field));
  if ( isAdminSet ){ vs.var('input:add_name_to_multimatch', 'enabled'); }

  // Search in the user lang
  if(clean.lang && _.isString(clean.lang.iso6391)) {
    vs.var('lang', clean.lang.iso6391);

    const field = toSingleField(vs.var('admin:add_name_lang_to_multimatch:field').get(), clean.lang.iso6391);
    vs.var('admin:add_name_lang_to_multimatch:field', field);
  }

  return {
    type: 'autocomplete',
    body: query.render(vs)
  };
}

module.exports = generateQuery;
