const field = require('../helper/fieldValue');
const logger = require( 'pelias-logger' ).get( 'api' );
const _ = require('lodash');
const Debug = require('../helper/debug');
const debugLog = new Debug('middleware:change_language');

// note: responses from the language service are (at time of writing)
// all from the 'whosonfirst' source.
const LANG_SERVICE_SOURCE = 'whosonfirst';

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

      debugLog.push(req, {
        language: req.clean.lang.iso6391,
        translations,
        duration: Date.now() - start
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
  const requestLanguage = req.clean.lang.iso6393;

  // iterate over response documents
  res.data.forEach(doc => {

    // update name.default to the request language (if available)
    if (req.clean.lang.defaulted === false) {
      translateNameDefault(doc, req.clean.lang.iso6391);
    }

    // skip invalid records
    if( !doc || !doc.parent ){ return; }

    // iterate over doc.parent.* attributes
    for( const attr in doc.parent ){

      // match only attributes ending with '_id'
      const match = attr.match(/^(.*)_id$/);
      if( !match ){ continue; }

      // adminKey is the property name without the '_id'
      // eg. for 'country_id', adminKey would be 'country'.
      const adminKey = match[1];
      const adminValues = doc.parent[adminKey];

      // skip invalid/empty arrays
      if( !Array.isArray( adminValues ) || !adminValues.length ){ continue; }

      // iterate over adminValues (it's an array and can have more than one value)
      for( const i in adminValues ){

        // find the corresponding key from the '_id' Array
        const id = doc.parent[attr][i];
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
        if( adminKey === doc.layer && doc.source === LANG_SERVICE_SOURCE ){
          doc.name.default = translations[id].names[ requestLanguage ][0];
        }
      }
    }
  });
}

// update name.default with the corresponding translation if available
function translateNameDefault(doc, lang) {
  if (lang && _.has(doc, 'name.' + lang)) {
    doc.name.default = field.getStringValue(doc.name[lang]);
  }
}

module.exports = setup;
