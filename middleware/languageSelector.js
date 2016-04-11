var _ = require('lodash');

/**
 * Utility for setting default language if not explitly given
 */

function setup(peliasConfig) {
  var defaultLang;
  var languages = peliasConfig.languages;

  if (languages && languages.length>0) {
    defaultLang = languages[0];
  }
  defaultLang = defaultLang || 'default'; // fallback

  return function setQueryLanguage(req, res, next) {
   if (_.isUndefined(req.clean)) {
     return next();
   }

   req.clean.lang = req.clean.lang || defaultLang;
   next();
 };
}

module.exports = setup;
