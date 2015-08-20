
module.exports = function category_filter( query, params ) {
  if (params.categories && params.categories.length > 0) {
    query.query.filtered.filter.bool.must.push({
      terms: { category: params.categories }
    });
  }
};
