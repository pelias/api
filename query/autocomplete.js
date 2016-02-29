
var peliasQuery = require('pelias-query'),
    defaults = require('./autocomplete_defaults'),
    textParser = require('./text_parser'),
    viewsToQuery = require('./views_to_query'),
    check = require('check-types');


//------------------------------
// autocomplete query
//------------------------------
var query = new peliasQuery.layout.FilteredBooleanQuery();

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
viewsToQuery(views, query);

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

  return query.render( vs );
}

module.exports = generateQuery;
