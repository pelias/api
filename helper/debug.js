const _ = require('lodash');

class Debug {
  constructor(moduleName){
    this.name = moduleName || 'unnamed module';
  }

  getValueAndDest(req, args) {
    if (args.length === 0) {
      return {dest: req, value: undefined};
    } 

    if (args.length === 1) {
      return {dest: req, value: args[0]};
    } 
    
    if (args.length === 2) {
      return {dest: args[0], value: args[1]};
    }

    throw new Error('Too many arguments to function');
  }

  // two variants
  // - push(req, value) 
  //    checks req.clean.enableDebug and if true, pushes values onto req.debug
  // - push(req, dest, value) 
  //    checks req.clean.enableDebug and if true, pushes values onto dest.debug
  push(req, ...args){
    const { value, dest } = this.getValueAndDest(req, args);
    
    if (!req || _.isEmpty(req.clean) || !req.clean.enableDebug){
      return;
    }
    dest.debug = dest.debug || [];
    switch(typeof value) {
      case 'function':
        dest.debug.push({[this.name]: value()});
        break;
      default:
        dest.debug.push({[this.name]: value});
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
