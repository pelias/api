
var peliasQuery = require('pelias-query'),
    sort = require('../query/sort'),
    adminFields = require('../helper/adminFields')();

//------------------------------
// general-purpose search query
//------------------------------
var query = new peliasQuery.layout.FilteredBooleanQuery();

// mandatory matches
query.score( peliasQuery.view.boundary_country, 'must' );
query.score( peliasQuery.view.ngrams, 'must' );

// scoring boost
query.score( peliasQuery.view.phrase );
query.score( peliasQuery.view.focus );

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

// non-scoring hard filters
query.filter( peliasQuery.view.boundary_circle );
query.filter( peliasQuery.view.boundary_rect );

// --------------------------------

/**
  map request variables to query variables for all inputs
  provided by this HTTP request.
**/
function generateQuery( clean ){

  var vs = new peliasQuery.Vars( peliasQuery.defaults );

  // input text
  vs.var( 'input:name', clean.text );

  // size
  if( clean.size ){
    vs.var( 'size', clean.size );
  }

  // focus point
  if( clean.lat && clean.lon ){
    vs.set({
      'focus:point:lat': clean.lat,
      'focus:point:lon': clean.lon
    });
  }

  // focus viewport
  // @todo: change these to the correct request variable names
  // @todo: calculate the centroid from the viewport box
  // if( clean.focus.viewport ){
  //   var vp = clean.focus.viewport;
  //   vs.set({
  //     'focus:point:lat': vp.min_lat + ( vp.max_lat - vp.min_lat ) / 2,
  //     'focus:point:lon': vp.min_lon + ( vp.max_lon - vp.min_lon ) / 2
  //   });
  // }

  // boundary rect
  if( clean.bbox ){
    vs.set({
      'boundary:rect:top': clean.bbox.top,
      'boundary:rect:right': clean.bbox.right,
      'boundary:rect:bottom': clean.bbox.bottom,
      'boundary:rect:left': clean.bbox.left
    });
  }

  // boundary circle
  // @todo: change these to the correct request variable names
  // if( clean.boundary.circle ){
  //   vs.set({
  //     'boundary:circle:lat': clean.boundary.circle.lat,
  //     'boundary:circle:lon': clean.boundary.circle.lon,
  //     'boundary:circle:radius': clean.boundary.circle.radius + 'm'
  //   });
  // }

  // boundary country
  // @todo: change these to the correct request variable names
  // if( clean.boundary.country ){
  //   vs.set({
  //     'boundary:country': clean.boundary.country
  //   });
  // }

  // address parsing
  if( clean.parsed_text ){

    // is it a street address?
    var isStreetAddress = clean.parsed_text.hasOwnProperty('number') && clean.parsed_text.hasOwnProperty('street');
    if( isStreetAddress ){
      vs.var( 'input:name', clean.parsed_text.number + ' ' + clean.parsed_text.street );
    }

    // I don't understand this
    else if( clean.parsed_text.admin_parts ) {
      vs.var( 'input:name', clean.parsed_text.name );
    }

    // or this..
    else {
      console.warn( 'chaos monkey asks: what happens now?' );
      console.log( clean );
      try{ throw new Error(); } catch(e){ console.error( e.stack ); } // print a stack trace
    }

    // ==== add parsed matches [address components] ====

    // house number
    if( clean.parsed_text.hasOwnProperty('number') ){
      vs.var( 'input:housenumber', clean.parsed_text.number );
    }

    // street name
    if( clean.parsed_text.hasOwnProperty('street') ){
      vs.var( 'input:street', clean.parsed_text.street );
    }

    // postal code
    if( clean.parsed_text.hasOwnProperty('postalcode') ){
      vs.var( 'input:postcode', clean.parsed_text.postalcode );
    }

    // ==== add parsed matches [admin components] ====

    // city
    if( clean.parsed_text.hasOwnProperty('city') ){
      vs.var( 'input:admin2', clean.parsed_text.city );
    }

    // state
    if( clean.parsed_text.hasOwnProperty('state') ){
      vs.var( 'input:admin1_abbr', clean.parsed_text.state );
    }

    // country
    if( clean.parsed_text.hasOwnProperty('country') ){
      vs.var( 'input:alpha3', clean.parsed_text.country );
    }

    // ==== deal with the 'leftover' components ====
    // @todo: clean up this code

    // a concept called 'leftovers' which is just 'admin_parts' /or 'regions'.
    var leftoversString = '';
    if( clean.parsed_text.hasOwnProperty('admin_parts') ){
      leftoversString = clean.parsed_text.admin_parts;
    }
    else if( clean.parsed_text.hasOwnProperty('regions') ){
      leftoversString = clean.parsed_text.regions.join(' ');
    }

    // if we have 'leftovers' then assign them to any fields which
    // currently don't have a value assigned.
    if( leftoversString.length ){
      var unmatchedAdminFields = adminFields.slice();
      
      // cycle through fields and set fields which
      // are still currently unset
      unmatchedAdminFields.forEach( function( key ){
        if( !vs.isset( 'input:' + key ) ){
          vs.var( 'input:' + key, leftoversString );
        }
      });
    }
  }

  var result = query.render( vs );

  // @todo: remove unnessesary sort conditions
  result.sort = result.sort.concat( sort( clean ) );

  // @todo: remove this hack
  return JSON.parse( JSON.stringify( result ) );
}

module.exports = generateQuery;
