
/**
  this middleware is responsible for negotiating HTTP locales for incoming
  browser requests by reading the querystring param 'lang' or 'Accept-Language' request headers.

  the preferred language will then be available on the $req object:
  eg. for '?lang=fr' or 'Accept-Language: fr':
  ```
  console.log( req.language );

  {
    name: 'French',
    type: 'living',
    scope: 'individual',
    iso6393: 'fra',
    iso6392B: 'fre',
    iso6392T: 'fra',
    iso6391: 'fr',
    defaulted: false
  }
  ```

  for configuration options see:
  https://github.com/florrain/locale
**/

const locale = require('locale');

/**
  BCP47 language tags can contain three parts:
    1. A language subtag (en, zh).
    2. A script subtag (Hant, Latn).
    3. A region subtag (US, CN).

  at time of writing we will only be concerned with 1. (the language subtag) with
  the intention of being compatible with the language standard of whosonfirst data.

  whosonfirst data is in ISO 639-3 format so we will need to configure the library
  to support all ISO 639-1 (2 char) codes and convert them to 639-1 (3-char) codes.

  see: https://github.com/whosonfirst/whosonfirst-names
**/
const iso6393 = require('iso-639-3');

// create a dictionary which maps the ISO 639-1 language subtags to a map
// of it's represenation in several different standards.
const language = {};
iso6393.filter( i => !!i.iso6391 ).forEach( i => language[ i.iso6391 ] = i );

// a pre-processed locale list of language subtags we support (all of them).
const allLocales = new locale.Locales( Object.keys( language ) );

// return the middleware
module.exports = function middleware( req, res, next ){

  // input language, either from query param or header
  var input = ( req.query && req.query.lang ) || ( req.headers && req.headers['accept-language'] );

  // parse request & choose best locale
  var locales = new locale.Locales( input || '' );
  var best = locales.best( allLocales );

  // set $req.language property
  req.language = language[ best.language ] || language.en;
  req.language.defaulted = best.defaulted;

  // set $req.clean property in order to print language info in response header
  req.clean = req.clean || {};
  req.clean.lang = {
    name: req.language.name,
    iso6391: req.language.iso6391,
    iso6393: req.language.iso6393,
    defaulted: req.language.defaulted
  };

  next();
};
