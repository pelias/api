const all = require('predicates').all;
const not = require('predicates').not;

const sanitizers = require('../../sanitizer');
const predicates = require('../../controller/predicates');
const controllers = require('../../controller');
const queries = require('../../query');
const postProc = require('../../middleware');

const utils = require('./utils');


module.exports.create = (peliasConfig, esclient, services) => {

  const interpolationShouldExecute = utils.interpolationShouldExecute(services);
  const changeLanguageShouldExecute = utils.changeLanguageShouldExecute(services);

  return [
    sanitizers.structured_geocoding.middleware(peliasConfig.api),
    postProc.requestLanguage,
    postProc.calcSize(),
    controllers.search(peliasConfig.api, esclient, queries.structured_geocoding, not(predicates.hasResponseDataOrRequestErrors)),
    postProc.trimByGranularityStructured(),
    postProc.distances('focus.point.'),
    postProc.confidenceScores(peliasConfig.api),
    postProc.confidenceScoresFallback(),
    postProc.interpolate(services.interpolation.service, interpolationShouldExecute),
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