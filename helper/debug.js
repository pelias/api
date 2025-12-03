const _ = require('lodash');

class Debug {
  constructor(moduleName) {
    this.name = moduleName || 'unnamed module';
  }

  static isEnabled(req) {
    return _.get(req, 'clean.enableDebug') === true;
  }

  static validMessage(msg) {
    return _.isString(msg) && !_.isEmpty(msg);
  }

  push(req, value) {
    if (!Debug.isEnabled(req)) { return; }

    if (!_.isArray(req.debug)) { req.debug = []; }

    if (_.isFunction(value)) {
      req.debug.push({ [this.name]: value() });
    } else {
      req.debug.push({ [this.name]: value });
    }
  }
}

module.exports = Debug;
