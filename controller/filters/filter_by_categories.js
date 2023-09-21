function filterByCategories(req, renderedQuery) {
  if (!req || !req.query) {
      return;
  }

  if (!renderedQuery || !renderedQuery.body || !renderedQuery.body.query || !renderedQuery.body.query.bool) {
      return;
  }

  if (!renderedQuery.body.query.bool.filter) {
    renderedQuery.body.query.bool.filter = [];
  }

  // Entur:
  // Using req.query.categories bypasses the sanitizer function and
  // leaves intact the original categories filter from pelias-query package,
  // e.g.: query.filter( peliasQuery.view.categories );
  // in query/reverse.js#L24
  //
  // Instead we splice out categories from the rendered query and use that to add a
  // new filter, wich uses our own field.
  var index = renderedQuery.body.query.bool.filter.findIndex(f => f.terms && f.terms.category);
  var match = index !== -1 && renderedQuery.body.query.bool.filter.splice(index, 1).shift();
  var categories = match ? match.terms.category : [];

  if (categories.length > 0 && !categories.includes('no_filter')) {
      var categoriesTerms = {
          terms: {
              'category_filter': categories
          }
      };

      renderedQuery.body.query.bool.filter.push(categoriesTerms);
  }
}

module.exports = filterByCategories;