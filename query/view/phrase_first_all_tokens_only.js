const peliasQuery = require('pelias-query');
const toMultiFields = require('./helper').toMultiFields;
const _ = require('lodash');

module.exports = function (vs) {
  const view_name = 'first_all_tokens_only';
  // get a copy of the *complete* tokens produced from the input:name
  const raw_complete_tokens = vs.var('input:name:raw_tokens_complete').get();

  // if the parsed tokens (what's going to be searched in the must), are the same as the raw tokens
  // don't use this query since it will be redundant
  if (raw_complete_tokens.length === vs.var('input:name:tokens').get().length) {
    return null;
  }

  // if there's a housenumber and a street, don't do this because it might
  // make housenumber matching way too lenient
  if (vs.isset('input:housenumber') && vs.isset('input:street')) {
    return null;
  }


  // no valid tokens to use, fail now, don't render this view.
  if (!raw_complete_tokens || raw_complete_tokens.length < 1) {
    return null;
  }

  // set the 'input' variable to all but the last token
  vs.var(`match:${view_name}:input`).set(raw_complete_tokens.join(' '));
  vs.var(`match:${view_name}:field`).set(vs.var('phrase:field').get());

  vs.var(`match:${view_name}:analyzer`).set(vs.var('phrase:analyzer').get());
  vs.var(`match:${view_name}:minimum_should_match`).set(vs.var('phrase:minimum_should_match').get());

  return peliasQuery.view.leaf.match(view_name)(vs);
};
