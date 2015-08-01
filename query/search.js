
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
  var text = params.text;
  var parsed_text = params.parsed_text;

  if (params.bbox) {
    query = queries.bbox ( centroid, { size: params.size, bbox: params.bbox } );
  }

  query.query.filtered.query = {
    'bool': {
      'must': [],
      'should': []
    }
  };

  if (parsed_text) {

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

    // update input text
    if (parsed_text.number && parsed_text.street) {
      text = parsed_text.number + ' ' + parsed_text.street;
    } else if (parsed_text.admin_parts) {
      text = parsed_text.name;
    }

    // address
    // number, street, postalcode
    if (parsed_text.number) {
      qb(['address.number'], parsed_text.number);
    } 
    if (parsed_text.street) {
      qb(['address.street'], parsed_text.street);
    } 
    if (parsed_text.postalcode) {
      qb(['address.zip'], parsed_text.postalcode);
    } 

    // city
    // admin2, locality, local_admin, neighborhood
    if (parsed_text.city) {
      qb(['admin2'], parsed_text.admin2);
    } else {
      unmatched_admin_fields.push('admin2');
    }

    // state
    // admin1, admin1_abbr
    if (parsed_text.state) {
      qb(['admin1_abbr'], parsed_text.state);
    } else {
      unmatched_admin_fields.push('admin1', 'admin1_abbr');
    }

    // country
    // admin0, alpha3
    if (parsed_text.country) {
      qb(['alpha3'], parsed_text.country);
    } else {
      unmatched_admin_fields.push('admin0', 'alpha3');
    }

    var input_regions = parsed_text.regions ? parsed_text.regions.join(' ') : undefined;
    // if no address was identified and input text suggests some admin info in it
    if (unmatched_admin_fields.length === 5 &&  input_regions !== params.text) {
      if (parsed_text.admin_parts) {
        qb(unmatched_admin_fields, parsed_text.admin_parts);
      } else {
        qb(unmatched_admin_fields, input_regions);
      }
    }
  
  }

  // add search condition to distance query
  query.query.filtered.query.bool.must.push({ 
    'match': {
      'name.default': text
    }
  });

  // add phrase matching query
  // note: this is required for shingle/phrase matching
  query.query.filtered.query.bool.should.push({
    'match': {
      'phrase.default': text
    }
  });

  query.sort = query.sort.concat( sort( params ) );

  return query;
}

module.exports = generate;
