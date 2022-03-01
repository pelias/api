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

  beginTimer(req, message) {
    if (!Debug.isEnabled(req)) { return; }

    if (Debug.validMessage(message)) {
      this.push(req, `Timer Began. ${message}`);
    } else {
      this.push(req, `Timer Began.`);
    }

    return Date.now();
  }

  stopTimer(req, timer, message) {
    if (!Debug.isEnabled(req)) { return; }

    // measure elapsed duration
    const elapsed = _.isFinite(timer) ? (Date.now() - timer) : -1;

    if (Debug.validMessage(message)) {
      this.push(req, `Timer Stopped. ${elapsed} ms. ${message}`);
    } else {
      this.push(req, `Timer Stopped. ${elapsed} ms`);
    }
  }
}

module.exports = Debug;
