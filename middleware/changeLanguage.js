var field = require('../helper/fieldValue');
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

    const start = Date.now();
    service(req, res, (err, translations) => {
      // if there's an error, log it and bail
      if (err) {
        logger.error(err);
        return next();
      }

      logger.info('language', {
        response_time: Date.now() - start,
        language: req.clean.lang.iso6391,
        controller: 'language', //technically middleware, but this is consistent with other log lines
      });

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

    // update name.default to the request language (if available)
    if (req.clean.lang.defaulted === false) {
      translateNameDefault(doc, req.clean.lang.iso6391);
    }

    // skip invalid records
    if( !doc || !doc.parent ){ return; }

    // iterate over doc.parent.* attributes
    for( var attr in doc.parent ){

      // match only attributes ending with '_id'
      var match = attr.match(/^(.*)_id$/);
      if( !match ){ continue; }

      // adminLayer is the property name without the '_id'
      // eg. for 'country_id', adminLayer would be 'country'.
      var adminLayer = match[1];
      var adminValues = _.get(doc.parent, adminLayer);

      // skip invalid/empty arrays
      if( !Array.isArray( adminValues ) || !adminValues.length ){ continue; }

      // iterate over adminValues (it's an array and can have more than one value)
      for( var i in adminValues ){

        // find the corresponding key from the '_id' Array
        let adminID = _.get(doc.parent[attr], i);
        if (!adminID) { continue; }

        // find the corresponding key from the '_source' Array
        // dataset the parent property was sourced from, else 'whosonfirst'.
        // the language service *at time of writing* only returns translations
        // from whosonfirst, so we skip translating fields from other sources.
        // see: https://github.com/pelias/schema/pull/459
        // see: https://github.com/pelias/model/pull/128
        let adminSource = _.get(doc.parent, `${match}_source[${i}]`, 'whosonfirst');
        if (adminSource !== 'whosonfirst') { continue; }

        // adminID not found in translation service response
        if( !_.has(translations, adminID)){
          logger.debug( `[language] [debug] failed to find translations for ${adminID}` );
          continue;
        }

        // requested language is not available
        if (_.isEmpty(_.get(translations[adminID].names, requestLanguage, [] ))) {
          logger.debug( `[language] [debug] missing translation ${requestLanguage} ${adminID}` );
          continue;
        }

        // translate 'parent.*' property
        adminValues[i] = translations[adminID].names[ requestLanguage ][0];

        // if the record is an admin record we also translate the 'name.default' property.
        // note: ensure the records have the same 'layer' 'source' and 'source_id'.
        if (adminLayer !== doc.layer){ continue; }
        if (adminSource !== doc.source){ continue; }
        if (_.toString(adminID) !== _.toString(doc.source_id)){ continue; }
        doc.name.default = translations[adminID].names[requestLanguage][0];
      }
    }
  });
}

// boolean function to check if changing the language is required
function isLanguageChangeRequired( req, res ){
  return req && res && res.data && res.data.length &&
         req.hasOwnProperty('language');
}

// update name.default with the corresponding translation if available
function translateNameDefault(doc, lang) {
    if (lang && _.has(doc, 'name.' + lang)) {
        doc.name.default = field.getStringValue(doc.name[lang]);
    }
}

module.exports = setup;
