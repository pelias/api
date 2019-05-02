const _ = require('lodash');
const Debug = require('../../helper/debug');
const debugLog = new Debug('controller:predicates:is_pelias_parse');
const stackTraceLine = require('../../helper/stackTraceLine');

// returns true IFF req.clean.parser is pelias
module.exports = (req, res) => {
  const is_pelias_parse = _.get(req, 'clean.parser') === 'pelias';
  debugLog.push(req, () => ({
    reply: is_pelias_parse,
    stack_trace: stackTraceLine()
  }));
  return is_pelias_parse;
};
