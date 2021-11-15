const _ = require('lodash');
const debugEnabled = (req) => _.get(req, 'clean.enableDebug') === true;
const validMessage = (msg) => _.isString(msg) && !_.isEmpty(msg);

class Debug {
  constructor(moduleName) {
    this.name = moduleName || 'unnamed module';
  }

  getValueAndDest(req, args) {
    if (args.length === 0) {
      return { dest: req, value: undefined };
    }

    if (args.length === 1) {
      return { dest: req, value: args[0] };
    }

    if (args.length === 2) {
      return { dest: args[0], value: args[1] };
    }

    throw new Error('Too many arguments to function');
  }

  // two variants
  // - push(req, value)
  //    checks req.clean.enableDebug and if true, pushes values onto req.debug
  // - push(req, dest, value)
  //    checks req.clean.enableDebug and if true, pushes values onto dest.debug
  push(req, ...args) {
    if (!debugEnabled(req)) { return; }

    const { value, dest } = this.getValueAndDest(req, args);
    if (!_.isArray(dest.debug)) { dest.debug = []; }

    if (_.isFunction(value)) {
      dest.debug.push({ [this.name]: value() });
    } else {
      dest.debug.push({ [this.name]: value });
    }
  }

  beginTimer(req, message) {
    if (!debugEnabled(req)) { return; }

    if (validMessage(message)) {
      this.push(req, `Timer Began. ${message}`);
    } else {
      this.push(req, `Timer Began.`);
    }

    return Date.now();
  }

  stopTimer(req, timer, message) {
    if (!debugEnabled(req)) { return; }

    // measure elapsed duration
    const elapsed = _.isFinite(timer) ? (Date.now() - timer) : -1;

    if (validMessage(message)) {
      this.push(req, `Timer Stopped. ${elapsed} ms. ${message}`);
    } else {
      this.push(req, `Timer Stopped. ${elapsed} ms`);
    }
  }
}

module.exports = Debug;
