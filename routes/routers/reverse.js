const not = require('predicates').not;
const any = require('predicates').any;
const all = require('predicates').all;

const sanitizers = require('../../sanitizer');
const predicates = require('../../controller/predicates');
const controllers = require('../../controller');
const queries = require('../../query');
const postProc = require('../../middleware');

const utils = require('./utils');


module.exports.create = (peliasConfig, esclient, services) => {

  const changeLanguageShouldExecute = utils.changeLanguageShouldExecute(services);

  // execute under the following conditions:
  // - there are no errors or data
  // - request is not coarse OR pip service is disabled
  const nonCoarseReverseShouldExecute = all(
    not(predicates.hasResponseDataOrRequestErrors),
    any(
      not(predicates.isCoarseReverse),
      not(services.pip.isEnabled)
    )
  );

  // fallback to coarse reverse when regular reverse didn't return anything
  const coarseReverseShouldExecute = all(
    services.pip.isEnabled,
    not(predicates.hasRequestErrors),
    not(predicates.hasResponseData)
  );


  return [
    sanitizers.reverse.middleware,
    postProc.requestLanguage,
    postProc.calcSize(),
    controllers.search(peliasConfig.api, esclient, queries.reverse, nonCoarseReverseShouldExecute),
    controllers.coarse_reverse(services.pip.service, coarseReverseShouldExecute),
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
  ];
};