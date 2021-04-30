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
  if (q.query && q.query.bool && q.query.bool.filter && q.query.bool.filter.some(f => f.must_not)) {
    q.query.bool.filter = q.query.bool.filter.reduce(function(acc, f) {
        if (f.must_not) {
          acc.bool.must_not.bool.filter.push(f.must_not);
          acc.bool.must_not.bool.must.script = f.script;
        } else {
          acc.bool.must.push(f);
        }
        return acc;
      }, {
        bool: {
          must_not: {
            bool: {
              filter: [],
              must: {
                script: {}
              }
            }
          },
          must: []
        }
      });
  }
  return q;
}

module.exports = postprocess;
