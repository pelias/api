var _ = require( 'lodash' );
var type_mapping = require( '../helper/type_mapping' );

/*
 * This sanitizer depends on clean.layers and clean.sources
 * so it has to be run after those sanitizers have been run
 */
function _sanitize( raw, clean ){
  var messages = { errors: [], warnings: [] };

  var possible_errors = [];
  var at_least_one_valid_combination = false;

  if (clean.layers && clean.sources) {
    clean.sources.forEach(function(source) {
      var layers_for_source = type_mapping.layers_by_source[source];
      clean.layers.forEach(function(layer) {
        if (_.includes(layers_for_source, layer)) {
          at_least_one_valid_combination = true;
        } else {
          var message = 'You have specified both the `sources` and `layers` ' +
            'parameters in a combination that will return no results: the ' +
            source + ' source has nothing in the ' + layer + ' layer';
          possible_errors.push(message);
        }
      });
    });

    if (!at_least_one_valid_combination) {
      messages.errors = possible_errors;
    }
  }

  return messages;
}

function _expected(){
  return [{ 'name': 'sources' }, { 'name': 'layers' }];
}

module.exports = () => ({
  sanitize: _sanitize,
  expected: _expected
});
