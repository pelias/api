const not = require('predicates').not;

const sanitizers = require('../../sanitizer');
const predicates = require('../../controller/predicates');
const controllers = require('../../controller');
const queries = require('../../query');
const postProc = require('../../middleware');

const utils = require('./utils');


module.exports.create = (peliasConfig, esclient, services) => {

  const changeLanguageShouldExecute = utils.changeLanguageShouldExecute(services);

  return [
    sanitizers.autocomplete.middleware(peliasConfig.api),
    postProc.requestLanguage,
    controllers.search(peliasConfig.api, esclient, queries.autocomplete, not(predicates.hasResponseDataOrRequestErrors)),
    postProc.distances('focus.point.'),
    postProc.confidenceScores(peliasConfig.api),
    postProc.dedupe(),
    postProc.accuracy(),
    postProc.localNamingConventions(),
    postProc.renamePlacenames(),
    postProc.parseBoundingBox(),
    postProc.normalizeParentIds(),
    postProc.changeLanguage(services.language.service, changeLanguageShouldExecute),
    postProc.assignLabels(),
    postProc.geocodeJSON(peliasConfig.api, utils.base),
    postProc.sendJSON
  ];
};