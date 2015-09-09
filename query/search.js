
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

function generateQuery( clean ){

  var vs = new peliasQuery.Vars( peliasQuery.defaults );

  // set input text
  vs.var( 'input:name', clean.input );

  // set size
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

  // bbox
  if( clean.bbox ){
    vs.set({
      'boundary:rect:top': clean.bbox.top,
      'boundary:rect:right': clean.bbox.right,
      'boundary:rect:bottom': clean.bbox.bottom,
      'boundary:rect:left': clean.bbox.left
    });
  }

  // address parsing
  if( clean.parsed_input ){

    // is it a street address?
    var isStreetAddress = clean.parsed_input.hasOwnProperty('number') && clean.parsed_input.hasOwnProperty('street');
    if( isStreetAddress ){
      vs.var( 'input:name', clean.parsed_input.number + ' ' + clean.parsed_input.street );
    }

    // I don't understand this
    else if( clean.parsed_input.admin_parts ) {
      vs.var( 'input:name', clean.parsed_input.name );
    }

    // or this..
    else {
      console.warn( 'chaos monkey asks: what happens now?' );
      console.log( clean );
      try{ throw new Error(); } catch(e){ console.error( e.stack ); } // print a stack trace
    }

    // ==== add parsed matches [address components] ====

    // house number
    if( clean.parsed_input.hasOwnProperty('number') ){
      vs.var( 'input:housenumber', clean.parsed_input.number );
    }

    // street name
    if( clean.parsed_input.hasOwnProperty('street') ){
      vs.var( 'input:street', clean.parsed_input.street );
    }

    // postal code
    if( clean.parsed_input.hasOwnProperty('postalcode') ){
      vs.var( 'input:postcode', clean.parsed_input.postalcode );
    }

    // ==== add parsed matches [admin components] ====

    // city
    if( clean.parsed_input.hasOwnProperty('city') ){
      vs.var( 'input:admin2', clean.parsed_input.city );
    }

    // state
    if( clean.parsed_input.hasOwnProperty('state') ){
      vs.var( 'input:admin1_abbr', clean.parsed_input.state );
    }

    // country
    if( clean.parsed_input.hasOwnProperty('country') ){
      vs.var( 'input:alpha3', clean.parsed_input.country );
    }

    // ==== deal with the 'leftover' components ====
    // @todo: clean up this code

    // a concept called 'leftovers' which is just 'admin_parts' /or 'regions'.
    var leftoversString = '';
    if( clean.parsed_input.hasOwnProperty('admin_parts') ){
      leftoversString = clean.parsed_input.admin_parts;
    }
    else if( clean.parsed_input.hasOwnProperty('regions') ){
      leftoversString = clean.parsed_input.regions.join(' ');
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
