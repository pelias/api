const controllers = require('../../controller');

const utils = require('./utils');


module.exports.create = (peliasConfig) => {
  return utils.createRouter([
    controllers.mdToHTML(peliasConfig.api, './public/apiDoc.md')
  ]);
};