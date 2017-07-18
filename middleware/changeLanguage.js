
var logger = require( 'pelias-logger' ).get( 'api' );
var service = require('../service/language');
const _ = require('lodash');

/**
example response from language web service:
{
  "101748479": {
    "wofid": 101748479,
    "placetype": "locality",
    "iso": "DE",
    "area": 0.031614,
    "lineage": {
      "continent_id": 102191581,
      "country_id": 85633111,
      "county_id": 102063261,
      "locality_id": 101748479,
      "macrocounty_id": 404227567,
      "region_id": 85682571
    },
    "rowid": 90425,
    "names": {
      "default": "München",
      "eng": "Munich"
    }
  },
}
**/

function setup() {
  var transport = service.findById();
  var middleware = function(req, res, next) {

    // no-op, request did not require a language change
    if( !isLanguageChangeRequired( req, res ) ){
      return next();
    }

    // collect a list of parent ids to fetch translations for
    var ids = extractIds( res );

    // perform language lookup for all relevant ids
    var timer = (new Date()).getTime();
    transport.query( ids, function( err, translations ){

      // update documents using a translation map
      if( err ){
        logger.error( '[language] [error]', err );
      } else {
        updateDocs( req, res, translations );
      }

      logger.info( '[language] [took]', (new Date()).getTime() - timer, 'ms' );
      next();
    });
  };

  middleware.transport = transport;
  return middleware;
}

// collect a list of parent ids to fetch translations for
function extractIds( res ){

  // store ids in an object in order to avoid duplicates
  var ids = {};

  // convenience function for adding a new id to the object
  function addId(id) {
    ids[id] = true;
  }

  // extract all parent ids from documents
  res.data.forEach( function( doc ){

    // skip invalid records
    if( !doc || !doc.parent ){ return; }

    // iterate over doc.parent.* attributes
    for( var attr in doc.parent ){

      // match only attributes ending with '_id'
      var match = attr.match(/_id$/);
      if( !match ){ continue; }

      // skip invalid/empty arrays
      if( !Array.isArray( doc.parent[attr] ) || !doc.parent[attr].length ){
        continue;
      }

      // add each id as a key in the ids object
      doc.parent[attr].forEach( addId );
    }
  });

  // return a deduplicated array of ids
  return Object.keys( ids );
}

// update documents using a translation map
function updateDocs( req, res, translations ){

  // sanity check arguments
  if( !req || !res || !res.data || !translations ){ return; }

  // this is the target language we will be translating to
  var requestLanguage = req.language.iso6393;

  // iterate over response documents
  res.data.forEach( function( doc, p ){

    // skip invalid records
    if( !doc || !doc.parent ){ return; }

    // iterate over doc.parent.* attributes
    for( var attr in doc.parent ){

      // match only attributes ending with '_id'
      var match = attr.match(/^(.*)_id$/);
      if( !match ){ continue; }

      // adminKey is the property name without the '_id'
      // eg. for 'country_id', adminKey would be 'country'.
      var adminKey = match[1];
      var adminValues = doc.parent[adminKey];

      // skip invalid/empty arrays
      if( !Array.isArray( adminValues ) || !adminValues.length ){ continue; }

      // iterate over adminValues (it's an array and can have more than one value)
      for( var i in adminValues ){

        // find the corresponding key from the '_id' Array
        var id = doc.parent[attr][i];
        if( !id ){ continue; }

        // id not found in translation service response
        if( !translations.hasOwnProperty( id ) ){
          logger.error( '[language] [error]', 'failed to find translations for', id );
          continue;
        }

        // skip invalid records
        if( !translations[id].hasOwnProperty( 'names' ) ){ continue; }

        // requested language is not available
        if (_.isEmpty(_.get(translations[id].names, requestLanguage, [] ))) {
          logger.info( '[language] [info]', 'missing translation', requestLanguage, id );
          continue;
        }

        // translate 'parent.*' property
        adminValues[i] = translations[id].names[ requestLanguage ][0];

        // if the record is an admin record we also translate
        // the 'name.default' property.
        if( adminKey === doc.layer ){
          doc.name.default = translations[id].names[ requestLanguage ][0];
        }
      }
    }
  });
}

// boolean function to check if changing the language is required
function isLanguageChangeRequired( req, res ){
  return req && res && res.data && res.data.length &&
         req.hasOwnProperty('language');
}

module.exports = setup;
