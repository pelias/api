const _ = require('lodash');
const Debug = require('../../helper/debug');
const debugLog = new Debug('controller:predicates:is_request_sources_only_whosonfirst');
const stackTraceLine = require('../../helper/stackTraceLine');

// returns true IFF req.clean.parsed_text contains exactly 1 field
module.exports = (req, res) => {
  const is_single_field_analysis = _.keys(_.get(req, ['clean', 'parsed_text'])).length === 1;

  debugLog.push(req, () => ({
    reply: is_single_field_analysis,
    stack_trace: stackTraceLine()
  }));

  return is_single_field_analysis;

};
