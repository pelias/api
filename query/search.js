
var queries = require('geopipes-elasticsearch-backend').queries,
    sort = require('../query/sort'),
    adminFields = require('../helper/adminFields').availableFields,
    addressWeights = require('../helper/address_weights');


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
    addParsedMatch(query, input, params.parsed_input);

    // update input
    if (params.parsed_input.number && params.parsed_input.street) {
      input = params.parsed_input.number + ' ' + params.parsed_input.street;
    } else if (params.parsed_input.admin_parts) {
      input = params.parsed_input.name;
    }
  }

  // add search condition to distance query
  query.query.filtered.query.bool.must.push({ 
    'match': {
      'name.default': input
    }
  });

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

function addParsedMatch(query, defaultInput, parsedInput) {
  query.query.filtered.query.bool.should = [];

  // copy expected admin fields so we can remove them as we parse the address
  var unmatchedAdminFields = adminFields.slice();

  // address
  // number, street, postalcode
  addMatch(query, unmatchedAdminFields, 'address.number', parsedInput.number, addressWeights.number);
  addMatch(query, unmatchedAdminFields, 'address.street', parsedInput.street, addressWeights.street);
  addMatch(query, unmatchedAdminFields, 'address.zip', parsedInput.postalcode, addressWeights.zip);

  // city
  // admin2, locality, local_admin, neighborhood
  addMatch(query, unmatchedAdminFields, 'admin2', parsedInput.admin2, addressWeights.admin2);

  // state
  // admin1, admin1_abbr
  addMatch(query, unmatchedAdminFields, 'admin1_abbr', parsedInput.state, addressWeights.admin1_abbr);

  // country
  // admin0, alpha3
  addMatch(query, unmatchedAdminFields, 'alpha3', parsedInput.country, addressWeights.alpha3);

  var inputRegions = parsedInput.regions ? parsedInput.regions.join(' ') : undefined;
  // if no address was identified and input suggests some admin info in it
  if (unmatchedAdminFields.length > 0 &&  inputRegions !== defaultInput) {
    unmatchedAdminFields.forEach(function (key) {
      if (parsedInput.admin_parts) {
        addMatch(query, [], key, parsedInput.admin_parts);
      }
      else {
        addMatch(query, [], key, inputRegions);
      }
    });
  }
}

function addMatch(query, unmatched, key, value, boost) { // jshint ignore:line
  if (typeof value === 'undefined') {
    return;
  }

  var match = {};

  if (boost) {
    match[key] = {
      query: value,
      boost: boost
    };
  }
  else {
    match[key] = value;
  }

  query.query.filtered.query.bool.should.push({ 'match': match });

  var index = unmatched.indexOf(key);
  if (index !== -1) {
    unmatched.splice(index, 1);
  }
}

module.exports = generate;
