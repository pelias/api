const peliasQuery = require('pelias-query');

module.exports = (view_name) => (vs) => {
  const input = vs.var(`multi_match:${view_name}:input`).get();

  if (!input || input.length < 1) {
    return null;
  }

  return peliasQuery.view.leaf.multi_match(view_name)(vs);
};
