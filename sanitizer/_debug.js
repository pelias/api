const _ = require('lodash');

/**
* @param {object} exposeInternalDebugTools property of pelias config
*/
function _setup(exposeInternalDebugTools) {
  return {
    sanitize: (raw, clean) => {
      const messages = { errors: [], warnings: [] };

      if (_.isUndefined(raw.debug)) {
        return messages;
      }

      clean.enableDebug = false;
      clean.exposeInternalDebugTools = exposeInternalDebugTools || false;

      if (_.isEqual(raw.debug, {})) {
        return messages;
      }

      const debugStr = raw.debug.toString().toLowerCase();

      const debugLevelMapping = {
        'false': 0,
        'true': 1,
        'elastic': 2,
        'explain': 3
      };

      const numericDebugStr = Number(debugStr);
      
      const debugLevel = isNaN(numericDebugStr) ? debugLevelMapping[debugStr] : numericDebugStr;

      if (_.isNil(debugLevel)) {
        messages.errors.push('Unknown debug value: ' + debugStr);
      }

      if (debugLevel >= 2 && !exposeInternalDebugTools) {
        messages.errors.push('Debug level not enabled: ' + debugStr);
      } else {
        if (debugLevel >= 1) {
          clean.enableDebug = true;
        }
        if (debugLevel >= 2) {
          clean.enableElasticDebug = true;
        }
        if (debugLevel >= 3) {
          clean.enableElasticExplain = true;
        }
      }

      return messages;
    },

    expected: () => {
      return [{ name: 'debug' }];
    },
  };
}

module.exports = _setup;
