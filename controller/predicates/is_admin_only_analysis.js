const _ = require('lodash');
const Debug = require('../../helper/debug');
const debugLog = new Debug('controller:predicates:is_admin_only_analysis');
const stackTraceLine = require('../../helper/stackTraceLine');

module.exports = (request, response) => {
  if (!request.clean.hasOwnProperty('parsed_text')) {
    debugLog.push(request, false + ' (no parsed_text)');
    return false;
  }

  // return true only if all non-admin properties of parsed_text are empty
  const is_admin_only_analysis = ['number', 'street', 'query', 'category', 'postalcode'].every((prop) => {
    return _.isEmpty(request.clean.parsed_text[prop]);
  });

  debugLog.push(request, () => ({
    reply: is_admin_only_analysis,
    stack_trace: stackTraceLine()
  }));
  return is_admin_only_analysis;
};
