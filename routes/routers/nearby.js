const not = require('predicates').not;

const sanitizers = require('../../sanitizer');
const predicates = require('../../controller/predicates');
const controllers = require('../../controller');
const queries = require('../../query');
const postProc = require('../../middleware');

const utils = require('./utils');


module.exports.create = (peliasConfig, esclient, services) => {

  const changeLanguageShouldExecute = utils.changeLanguageShouldExecute(services);

  return utils.createRouter([
    sanitizers.nearby.middleware,
    postProc.requestLanguage,
    postProc.calcSize(),
    controllers.search(peliasConfig.api, esclient, queries.reverse, not(predicates.hasResponseDataOrRequestErrors)),
    postProc.distances('point.'),
    // reverse confidence scoring depends on distance from origin
    //  so it must be calculated first
    postProc.confidenceScoresReverse(),
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
  ]);
};