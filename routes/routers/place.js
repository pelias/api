const sanitizers = require('../../sanitizer');
const controllers = require('../../controller');
const postProc = require('../../middleware');

const utils = require('./utils');


module.exports.create = (peliasConfig, esclient, services) => {

  const changeLanguageShouldExecute = utils.changeLanguageShouldExecute(services);

  return utils.createRouter([
    sanitizers.place.middleware,
    postProc.requestLanguage,
    controllers.place(peliasConfig.api, esclient),
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