const controllers = require('../../controller');

const utils = require('./utils');


module.exports.create = () => {
  return utils.createRouter([ controllers.status ]);
};