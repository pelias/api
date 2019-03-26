module.exports = function (vs) {

  // validate required params
  if (!vs.isset('input:name') ||
    !vs.isset('fuzzy:analyzer') ||
    !vs.isset('fuzzy:field') ||
    !vs.isset('fuzzy:boost')) {
    return null;
  }

  // base view
  var view = { 'match': {} };

  // match query
  view.match[vs.var('fuzzy:field')] = {
    analyzer: vs.var('fuzzy:analyzer'),
    boost: vs.var('fuzzy:boost'),
    query: vs.var('input:name')
  };

  if (vs.isset('fuzzy:operator')) {
    view.match[vs.var('fuzzy:field')].operator = vs.var('fuzzy:operator');
  }

  if (vs.isset('fuzzy:fuzziness')) {
    view.match[vs.var('fuzzy:field')].fuzziness = vs.var('fuzzy:fuzziness');

    if (vs.isset('fuzzy:prefix_length')) {
      view.match[vs.var('fuzzy:field')].prefix_length = vs.var('fuzzy:prefix_length');
    }
    if (vs.isset('fuzzy:max_expansions')) {
      view.match[vs.var('fuzzy:field')].max_expansions = vs.var('fuzzy:max_expansions');
    }
  }

  if (vs.isset('fuzzy:cutoff_frequency')) {
    view.match[vs.var('fuzzy:field')].cutoff_frequency = vs.var('fuzzy:cutoff_frequency');
  }

  return view;
};