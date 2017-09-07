const _ = require('lodash');
const Debug = require('../../helper/debug');
const debugLog = new Debug('controller:predicates:is_addressit_parse');
const stackTraceLine = require('../../helper/stackTraceLine');

// returns true IFF req.clean.parser is addressit
module.exports = (req, res) => {
  const is_addressit_parse = _.get(req, 'clean.parser') === 'addressit';
  debugLog.push(req, () => ({
    reply: is_addressit_parse,
    stack_trace: stackTraceLine()
  }));
  return is_addressit_parse;
};
