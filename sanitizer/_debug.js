var _ = require('lodash');

function _sanitize(raw, clean){
  const messages = {errors: [], warnings: []};

  if(!_.isUndefined(raw.debug) ){
    clean.enableDebug = (typeof raw.debug === 'string') ? isTruthy(raw.debug.toLowerCase()) : isTruthy( raw.debug );
  }
  return messages;
}

function _expected() {
  return [{ name: 'debug' }];
}

function isTruthy(val) {
  return _.includes( ['true', '1', 1, true], val );
}

module.exports = () => ({
  sanitize: _sanitize,
  expected: _expected
});
