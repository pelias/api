const peliasQuery = require('pelias-query');

/**
  Create view using a multi match on a specific lang.

  The lang boos is 2x higher than default index to promote lang matching first.
**/

module.exports = function( vs ){

  // validate required params
  if( !vs.isset('phrase:slop') ||
      !vs.isset('lang_multi_match:boost') ||
      !vs.isset('lang_multi_match:analyzer') ||
      !vs.isset('lang_multi_match:field') ){
    return null;
  }

  const boost = vs.var('lang_multi_match:boost');
  const lang = vs.var('lang_multi_match:lang');
  const fields = ['default', lang].map(ext => {
    const parts = vs.var('lang_multi_match:field').get().split('.');
    parts[parts.length - 1] = ext;
    return { field: parts.join('.'), boost: boost };
  });

  const view = peliasQuery.view.multi_match(
    vs,
    fields,
    vs.var('lang_multi_match:analyzer'),
    'input:name'
  );

  if ( vs.isset('lang_multi_match:operator') ) {
    view.multi_match.operator = vs.var('lang_multi_match:operator').get();
  }

  view.multi_match.type = 'phrase';
  view.multi_match.slop = vs.var('phrase:slop');
  view.multi_match.cutoff_frequency = 0.01;

  return view;
};
