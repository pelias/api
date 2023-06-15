const peliasQuery = require('pelias-query');
const { toMultiFields } = require('./helper');

/**
 * Custom function to build a view for a full text query with fuzziness.
 * It concatenates the search tokens and builds a multi_match query.
 *
 * Additional parameters can be set directly through the autocomplete_overrides file
 * using keys starting with `multi_match:full_text_search:*`
 */
module.exports = function(adminFields) {
  const viewName = 'full_text_search';
  const subview = peliasQuery.view.leaf.multi_match(viewName);

  return function (vs) {
    let input = vs.var('input:name').get();

    if (!input || input.length === 0) {
      return null;
    }

    // The remaining tokens (if any) are usually under admin fields
    const adminProperties = adminFields.filter(
      (field) => vs.isset(`input:${field}`) && vs.isset(`admin:${field}:field`) && 
        // TODO: find a better way to omit `add_name_to_multimatch` value (`enabled`) from the query's input.
        field !== 'add_name_to_multimatch'
    );

    const remainingTokens = adminProperties.length > 0 ?
      vs
        .var('input:' + adminProperties[0])
        .get()
        .split(/\s+/g)
      : [];

    if (remainingTokens.length > 0) {
      input = `${input} ${remainingTokens.join(' ')}`;
    }

    const fields = toMultiFields(
      vs.var(`multi_match:${viewName}:field`).get(),
      vs.var('lang').get()
    );

    const analyzer = vs.var('phrase:analyzer').get();

    // Using a new version of vs to make sure we are not mutating the original object
    const vsCopy = new peliasQuery.Vars(vs.export());

    vsCopy.var(`multi_match:${viewName}:input`).set(input);
    vsCopy.var(`multi_match:${viewName}:fields`).set(fields);
    vsCopy.var(`multi_match:${viewName}:analyzer`).set(analyzer);

    return subview(vsCopy);
  };
};
