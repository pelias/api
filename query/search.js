
var queries = require('geopipes-elasticsearch-backend').queries,
    sort = require('../query/sort'),
    adminFields = require('../helper/adminFields')(),
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
    // update input
    if (params.parsed_input.number && params.parsed_input.street) {
      input = params.parsed_input.number + ' ' + params.parsed_input.street;
    } else if (params.parsed_input.admin_parts) {
      input = params.parsed_input.name;
    }

    addParsedMatch(query, input, params.parsed_input);
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

/**
 * Traverse the parsed input object, containing all the address parts detected in query string.
 * Add matches to query for each identifiable component.
 *
 * @param {Object} query
 * @param {string} defaultInput
 * @param {Object} parsedInput
 */
function addParsedMatch(query, defaultInput, parsedInput) {
  query.query.filtered.query.bool.should = query.query.filtered.query.bool.should || [];

  // copy expected admin fields so we can remove them as we parse the address
  var unmatchedAdminFields = adminFields.slice();

  // address
  // number, street, postalcode
  addMatch(query, unmatchedAdminFields, 'address.number', parsedInput.number, addressWeights.number);
  addMatch(query, unmatchedAdminFields, 'address.street', parsedInput.street, addressWeights.street);
  addMatch(query, unmatchedAdminFields, 'address.zip', parsedInput.postalcode, addressWeights.zip);

  // city
  // admin2, locality, local_admin, neighborhood
  addMatch(query, unmatchedAdminFields, 'admin2', parsedInput.city, addressWeights.admin2);

  // state
  // admin1, admin1_abbr
  addMatch(query, unmatchedAdminFields, 'admin1_abbr', parsedInput.state, addressWeights.admin1_abbr);

  // country
  // admin0, alpha3
  addMatch(query, unmatchedAdminFields, 'alpha3', parsedInput.country, addressWeights.alpha3);

  addUnmatchedAdminFieldsToQuery(query, unmatchedAdminFields, parsedInput, defaultInput);
}

/**
 * Check for additional admin fields in the parsed input, and if any was found
 * combine into single string and match against all unmatched admin fields.
 *
 * @param {Object} query
 * @param {Array} unmatchedAdminFields
 * @param {Object} parsedInput
 * @param {string} defaultInput
 */
function addUnmatchedAdminFieldsToQuery(query, unmatchedAdminFields, parsedInput, defaultInput) {
  if (unmatchedAdminFields.length === 0 ) {
    return;
  }

  var leftovers = [];

  if (parsedInput.admin_parts) {
    leftovers.push(parsedInput.admin_parts);
  }
  else if (parsedInput.regions) {
    leftovers.push(parsedInput.regions);
  }

  if (leftovers.length === 0) {
    return;
  }

  leftovers = leftovers.join(' ');

  // if there are additional regions/admin_parts found
  if (leftovers !== defaultInput) {
    unmatchedAdminFields.forEach(function (key) {
      // combine all the leftover parts into one string
      addMatch(query, [], key, leftovers);
    });
  }
}

/**
 * Add key:value match to query. Apply boost if specified.
 *
 * @param {Object} query
 * @param {Array} unmatched
 * @param {string} key
 * @param {string|number|undefined} value
 * @param {number|undefined} [boost] optional
 */
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

  removeFromUnmatched(unmatched, key);
}

/**
 * If key is found in unmatched list, remove it from the array
 *
 * @param {Array} unmatched
 * @param {string} key
 */
function removeFromUnmatched(unmatched, key) {
  var index = unmatched.indexOf(key);
  if (index !== -1) {
    unmatched.splice(index, 1);
  }
}

module.exports = generate;
