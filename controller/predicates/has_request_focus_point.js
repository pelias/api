const _ = require('lodash');
const Debug = require('../../helper/debug');
const debugLog = new Debug('controller:predicates:has_request_errors');
const stackTraceLine = require('../../helper/stackTraceLine');

// returns true IFF req.clean has both focus.point.lat and focus.point.lon
module.exports = (req, res) => {
  const has_request_focus_point =
    _.has(req, ['clean', 'focus.point.lat']) &&
    _.has(req, ['clean', 'focus.point.lon']);

  debugLog.push(req, () => ({
    reply: has_request_focus_point,
    stack_trace: stackTraceLine()
  }));

  return has_request_focus_point;
  
};
