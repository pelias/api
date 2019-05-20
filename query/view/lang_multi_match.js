const peliasQuery = require('pelias-query');

/**
  Create view using a multi match on a specific lang.

  The lang boos is 2x higher than default index to promote lang matching first.
**/

module.exports = function( vs ){

  // validate required params
  if( !vs.isset('phrase:slop') ||
      !vs.isset('lang_multi_match:boost') ||
      !vs.isset('lang_multi_match:analyzer') ){
    return null;
  }

  const boost = vs.var('lang_multi_match:boost');
  const lang = vs.var('lang_multi_match:lang');

  const view = peliasQuery.view.multi_match(
    vs,
    [{ field: 'name.default', boost: boost }, { field: `name.${lang}`, boost: boost * 2 }],
    vs.var('lang_multi_match:analyzer'),
    'input:name'
  );

  view.multi_match.type = 'phrase';
  view.multi_match.operator = 'and';
  view.multi_match.slop = vs.var('phrase:slop');

  return view;
};
