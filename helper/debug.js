'use strict';
const _ = require('lodash');

class Debug {
  constructor(moduleName){
    this.name = moduleName || 'unnamed module';
  }

  push(req, debugMsg){
    if (!_.isEmpty(req.clean) && req.clean.enableDebug){
      req.debug = req.debug || [];
      // remove the extra space character
      req.debug.push({[this.name]: debugMsg});
    //  req.debug.push(`[${this.name}] ${debugMsg}`);
    }
  }
  // optional debugMsg passed to timer
  beginTimer(req, debugMsg){
    if (!_.isEmpty(req.clean) && req.clean.enableDebug){
      // internal object debugTimers. Doesn't get displayed in geocodeJSON
      req.debugTimers = req.debugTimers || {};
      req.debugTimers[this.name] = Date.now();
      if (debugMsg){
        this.push(req, `Timer Began: ${debugMsg}`);
      } else {
        this.push(req, `Timer Began`);
      }
    }
  }

  stopTimer(req, debugMsg){
    if (!_.isEmpty(req.clean) && req.clean.enableDebug){
      let timeElapsed = Date.now() - req.debugTimers[this.name];
      if (debugMsg){
        this.push(req, `Timer Stopped: ${timeElapsed} ms: ${debugMsg}`);
      } else {
        this.push(req, `Timer Stopped: ${timeElapsed} ms`);
      }
    }
  }
}

module.exports = Debug;
