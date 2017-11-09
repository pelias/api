const all = require('predicates').all;
const any = require('predicates').any;
const not = require('predicates').not;

const hasResponseData = require('./has_response_data');
const hasRequestErrors = require('./has_request_errors');
const hasParsedTextProperties = require('./has_parsed_text_properties');
const hasResultsAtLayers = require('./has_results_at_layers');

module.exports = {
  hasResponseData: hasResponseData,
  hasResultsAtLayers: hasResultsAtLayers,
  hasRequestErrors: hasRequestErrors,
  hasRequestFocusPoint: require('./has_request_focus_point'),
  isCoarseReverse: require('./is_coarse_reverse'),
  isAdminOnlyAnalysis: require('./is_admin_only_analysis'),
  isAddressItParse: require('./is_addressit_parse'),
  hasRequestCategories: require('./has_request_parameter')('categories'),
  isOnlyNonAdminLayers: require('./is_only_non_admin_layers'),

  // this can probably be more generalized
  isRequestSourcesOnlyWhosOnFirst: require('./is_request_sources_only_whosonfirst'),
  hasRequestParameter: require('./has_request_parameter'),
  hasParsedTextProperties: hasParsedTextProperties,
  isSingleFieldAnalysis: require('./is_single_field_analysis'),
  isVenueLayerRequested: require('./is_layer_requested')('venue'),

  // shorthand for standard early-exit conditions
  hasResponseDataOrRequestErrors: any(hasResponseData, hasRequestErrors),
  hasAdminOnlyResults: not(hasResultsAtLayers.any(['address', 'street'])),

  hasNumberButNotStreet: all(
    hasParsedTextProperties.any('number'),
    not(hasParsedTextProperties.any('street'))
  )
};
