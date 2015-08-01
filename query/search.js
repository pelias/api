
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
  var text = params.text;

  if (params.bbox) {
    query = queries.bbox ( centroid, { size: params.size, bbox: params.bbox } );
  }

  query.query.filtered.query = {
    'bool': {
      'must': [],
      'should': []
    }
  };

  if (params.parsed_text) {
    // update text
    if (params.parsed_text.number && params.parsed_text.street) {
      text = params.parsed_text.number + ' ' + params.parsed_text.street;
    } else if (params.parsed_text.admin_parts) {
      text = params.parsed_text.name;
    }

    addParsedMatch(query, text, params.parsed_text);
  }

  // add search condition to distance query
  query.query.filtered.query.bool.must.push({ 
    'match': {
      'name.default': {
        'query': text,
        'analyzer': 'peliasOneEdgeGram'
      }
    }
  });

  // add phrase matching query
  // note: this is required for shingle/phrase matching
  query.query.filtered.query.bool.should.push({
    'match': {
      'phrase.default': {
        'query': text,
        'analyzer': 'peliasPhrase',
        'type': 'phrase',
        'slop': 2
      }
    }
  });

  query.sort = query.sort.concat( sort( params ) );

  return query;
}

/**
 * Traverse the parsed text object, containing all the address parts detected in query string.
 * Add matches to query for each identifiable component.
 *
 * @param {Object} query
 * @param {string} defaultText
 * @param {Object} parsedText
 */
function addParsedMatch(query, defaultText, parsedText) {
  query.query.filtered.query.bool.should = query.query.filtered.query.bool.should || [];

  // copy expected admin fields so we can remove them as we parse the address
  var unmatchedAdminFields = adminFields.slice();

  // address
  // number, street, postalcode
  addMatch(query, unmatchedAdminFields, 'address.number', parsedText.number, addressWeights.number);
  addMatch(query, unmatchedAdminFields, 'address.street', parsedText.street, addressWeights.street);
  addMatch(query, unmatchedAdminFields, 'address.zip', parsedText.postalcode, addressWeights.zip);

  // city
  // admin2, locality, local_admin, neighborhood
  addMatch(query, unmatchedAdminFields, 'admin2', parsedText.city, addressWeights.admin2);

  // state
  // admin1, admin1_abbr
  addMatch(query, unmatchedAdminFields, 'admin1_abbr', parsedText.state, addressWeights.admin1_abbr);

  // country
  // admin0, alpha3
  addMatch(query, unmatchedAdminFields, 'alpha3', parsedText.country, addressWeights.alpha3);

  addUnmatchedAdminFieldsToQuery(query, unmatchedAdminFields, parsedText, defaultText);
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
