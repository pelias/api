const peliasQuery = require('pelias-query');
const _ = require('lodash');

module.exports = function (vs) {
  const view_name = 'first_all_tokens_only';
  // get a copy of the *complete* tokens produced from the input:name
  const raw_tokens_complete = vs.var('input:name:raw_tokens_complete').get();

  // if the parsed complete tokens (what's going to be searched in the must), are the same as the raw tokens
  // don't use this query since it will be redundant
  if (raw_tokens_complete.length === vs.var('input:name:tokens_complete').get().length) {
    return null;
  }

  // if there's a housenumber and a street, don't do this because it might
  // make housenumber matching way too lenient
  if (vs.isset('input:housenumber') && vs.isset('input:street')) {
    return null;
  }


  // no valid tokens to use, fail now, don't render this view.
  if (!raw_tokens_complete || raw_tokens_complete.length < 1) {
    return null;
  }

  // set the 'input' variable to all but the last token
  vs.var(`match:${view_name}:input`).set(raw_tokens_complete.join(' '));
  vs.var(`match:${view_name}:field`).set(vs.var('phrase:field').get());

  vs.var(`match:${view_name}:analyzer`).set(vs.var('phrase:analyzer').get());
  vs.var(`match:${view_name}:minimum_should_match`).set(vs.var('phrase:minimum_should_match').get());

  return peliasQuery.view.leaf.match(view_name)(vs);
};
