
var logger = require( 'pelias-logger' ).get( 'api' );
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

function setup(service, should_execute) {
  return function controller(req, res, next) {
    if (!should_execute(req, res)) {
      return next();
    }

    service(req, res, (err, translations) => {
      // if there's an error, log it and bail
      if (err) {
        logger.info(`[middleware:language][error]`);
        logger.error(err);
        return next();
      }

      // otherwise, update all the docs with translations
      updateDocs(req, res, _.defaultTo(translations, []));
      next();

    });

  };

}

// update documents using a translation map
function updateDocs( req, res, translations ){
  // this is the target language we will be translating to
  var requestLanguage = req.clean.lang.iso6393;

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
        if( !_.has(translations, id)){
          logger.debug( `[language] [debug] failed to find translations for ${id}` );
          continue;
        }

        // requested language is not available
        if (_.isEmpty(_.get(translations[id].names, requestLanguage, [] ))) {
          logger.debug( `[language] [debug] missing translation ${requestLanguage} ${id}` );
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
