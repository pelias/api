var autocompleteDefaults = require('./autocomplete_defaults');
var _ = require('lodash');

module.exports = _.merge({}, autocompleteDefaults, {
  'population:field': 'population',
  'population:modifier': 'none',
  'population:max_boost': 20,
  'population:weight': 3,
  'population:factor': 0.0002,
});
