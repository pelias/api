const peliasQuery = require('pelias-query');
const toMultiFields = require('./helper').toMultiFields;
const _ = require('lodash');

module.exports = function (vs) {
  console.log(vs.var('input:name:raw_tokens').get(), vs.var('input:name:tokens').get());
  console.log(_.eq(vs.var('input:name:raw_tokens').get(), vs.var('input:name:tokens').get()));
  console.log(vs.var('input:name:raw_tokens').get() === vs.var('input:name:tokens').get());
  if (vs.var('input:name:raw_tokens').get().length === vs.var('input:name:tokens').get().length) {
    return null;
  }

  const view_name = 'first_all_tokens_only';
  // get a copy of the *complete* tokens produced from the input:name
  console.log(vs.var('input:name:raw_tokens').get());
  const tokens = vs.var('input:name:raw_tokens_complete').get();
  console.log('all tokens only', { tokens });

  // no valid tokens to use, fail now, don't render this view.
  if (!tokens || tokens.length < 1) {
    return null;
  }

  // set the 'input' variable to all but the last token
  vs.var(`multi_match:${view_name}:input`).set(tokens.join(' '));
  vs.var(`multi_match:${view_name}:fields`).set(
    toMultiFields(vs.var('phrase:field').get(), vs.var('lang').get())
  );

  vs.var(`multi_match:${view_name}:analyzer`).set(vs.var('phrase:analyzer').get());
  vs.var(`multi_match:${view_name}:boost`).set(vs.var('phrase:boost').get());
  vs.var(`multi_match:${view_name}:slop`).set(vs.var('phrase:slop').get());

  // return {
  //   function_score: {
  //     query: peliasQuery.view.leaf.multi_match(view_name)(vs),
  //     boost: '1',
  //   },
  // };

  // return {
  //   function_score: {
  return peliasQuery.view.leaf.multi_match(view_name)(vs);
  //     boost: '1',
  //   },
  // };
};
