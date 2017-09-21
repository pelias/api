'use strict';
const _ = require('lodash');

class Debug {
  constructor(moduleName){
    this.name = moduleName || 'unnamed module';
  }

  push(req, value){
    if (!req || _.isEmpty(req.clean) || !req.clean.enableDebug){
      return;
    }
    req.debug = req.debug || [];
    switch(typeof value) {
      case 'function':
        req.debug.push({[this.name]: value()});
        break;
      default:
        req.debug.push({[this.name]: value});
    }
  }

  beginTimer(req, debugMsg){
     if (req && !_.isEmpty(req.clean) && req.clean.enableDebug){
       // debugMsg is optional
       this.push(req, () => {
         if (debugMsg){
           return `Timer Began. ${debugMsg}`;
         } else {
           return `Timer Began`;
         }
       });
       return Date.now();
     }
   }

  stopTimer(req, startTime, debugMsg){
    if (req && !_.isEmpty(req.clean) && req.clean.enableDebug){
      let timeElapsed = Date.now() - startTime;
        this.push(req, () => {
          if (debugMsg){
            return `Timer Stopped. ${timeElapsed} ms. ${debugMsg}`;
          } else {
            return `Timer Stopped. ${timeElapsed} ms`;
          }
        });
      }
    }

}

module.exports = Debug;
