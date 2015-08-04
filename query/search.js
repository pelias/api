
var queries = require('geopipes-elasticsearch-backend').queries,
    sort = require('../query/sort');

function generate( params ){
  var centroid = null;

  if ( params.lat && params.lon ){
    centroid = {
      lat: params.lat,
      lon: params.lon
    };
  } 
  
  var query = queries.distance( centroid, { size: params.size } );
  var input = params.input;

  if (params.bbox) {
    query = queries.bbox ( centroid, { size: params.size, bbox: params.bbox } );
  }

  query.query.filtered.query = {
    'bool': {
      'must': [],
      'should': []
    }
  };

  if (params.parsed_input) {

    query.query.filtered.query.bool.should = [];

    var unmatched_admin_fields = [];
    // qb stands for query builder
    var qb = function(unmatched_admin_fields, value) {
      if (value) {
        unmatched_admin_fields.forEach(function(admin_field) {
          var match = {};
          match[admin_field] = value;
          query.query.filtered.query.bool.should.push({
             'match': match
          });
        });  
      }
    };

    // update input
    if (params.parsed_input.number && params.parsed_input.street) {
      input = params.parsed_input.number + ' ' + params.parsed_input.street;
    } else if (params.parsed_input.admin_parts) {
      input = params.parsed_input.name;
    }

    // address
    // number, street, postalcode
    if (params.parsed_input.number) {
      qb(['address.number'], params.parsed_input.number);
    } 
    if (params.parsed_input.street) {
      qb(['address.street'], params.parsed_input.street);
    } 
    if (params.parsed_input.postalcode) {
      qb(['address.zip'], params.parsed_input.postalcode);
    } 

    // city
    // admin2, locality, local_admin, neighborhood
    if (params.parsed_input.city) {
      qb(['admin2'], params.parsed_input.admin2);
    } else {
      unmatched_admin_fields.push('admin2');
    }

    // state
    // admin1, admin1_abbr
    if (params.parsed_input.state) {
      qb(['admin1_abbr'], params.parsed_input.state);
    } else {
      unmatched_admin_fields.push('admin1', 'admin1_abbr');
    }

    // country
    // admin0, alpha3
    if (params.parsed_input.country) {
      qb(['alpha3'], params.parsed_input.country);
    } else {
      unmatched_admin_fields.push('admin0', 'alpha3');
    }

    var input_regions = params.parsed_input.regions ? params.parsed_input.regions.join(' ') : undefined;
    // if no address was identified and input suggests some admin info in it
    if (unmatched_admin_fields.length === 5 &&  input_regions !== params.input) {
      if (params.parsed_input.admin_parts) {
        qb(unmatched_admin_fields, params.parsed_input.admin_parts);
      } else {
        qb(unmatched_admin_fields, input_regions);
      }
    }
  
  }

  // add search condition to distance query
  query.query.filtered.query.bool.must.push({ 
    'match': {
      'name.default': input
    }
  });

  if (params.categories && params.categories.length > 0) {
    query.query.filtered.filter.bool.must.push({
      terms: { category: params.categories }
    });
  }

  // add phrase matching query
  // note: this is required for shingle/phrase matching
  query.query.filtered.query.bool.should.push({
    'match': {
      'phrase.default': input
    }
  });

  query.sort = query.sort.concat( sort( params ) );

  return query;
}

module.exports = generate;
