/**
 * pelias-query does not support must_not filters, so this function
 * post-processes a rendered query so must_not filters are rendered
 * correctly
 * 
 * q.query.bool.filter by default a list of implicit must filters. If
 * enabled, the exclude_terms view, adds explicit must_not filters.
 * The implicit must filters have to be moved into its own list property.
 * 
*/
function postprocess(q) {
    q.query.bool.filter = q.query.bool.filter.reduce(function(acc, f) {
        if (f.must_not) {
          Object.keys(f.must_not.terms).forEach(function(property) {
            acc.bool.must_not.terms[property] = f.must_not.terms[property];
          });
        }
        else {
          acc.must.push(f);
        }
        return acc;
      }, {
        bool: {
          must_not: {
            'terms': {}
          },
          must: []
        }
      });
    return q;
}

module.exports = postprocess;