const _ = require('lodash');
const toMultiFieldsWithWildcards = require('./helper').toMultiFieldsWithWildcards;

const optional_params = [
  'boost',
  'slop',
  'operator',
  'analyzer',
  'cutoff_frequency',
  'fuzziness',
  'max_expansions',
  'prefix_length',
  'fuzzy_transpositions',
  'minimum_should_match',
  'zero_terms_query'
];

module.exports = (namespace, prefix, type) => {
  return (vs) => {
    const input_variable = `${namespace}:${prefix}:input`;
    const field_variable = `${namespace}:${prefix}:field`;

    if (!vs.isset(input_variable) || !vs.isset(field_variable)) {
      return null;
    }

    const query = {
      multi_match: {
        query: vs.var(input_variable),
        fields: toMultiFieldsWithWildcards(
          vs.var(field_variable).get(),
          vs.var('lang').get(),
        )
      }
    };

    // optional 'type'
    if (_.isString(type)) {
      query.multi_match.type = type;
    }

    // other optional params
    optional_params.forEach((param) => {
      const variable_name = `${namespace}:${prefix}:${param}`;
      if (vs.isset(variable_name)) {
        query.multi_match[param] = vs.var(variable_name);
      }
    });

    return query;
  };
};
