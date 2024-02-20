function filterByParentIds(req, renderedQuery) {
  if (!req || !req.query) {
      return;
  }
  if (!renderedQuery || !renderedQuery.body || !renderedQuery.body.query || !renderedQuery.body.query.bool) {
      return;
  }
  var countyIds = req.query['boundary.county_ids'];
  var localityIds = req.query['boundary.locality_ids'];
  if (countyIds || localityIds) {
      if (!renderedQuery.body.query.bool.filter) {
          renderedQuery.body.query.bool.filter = [];
      }

      if (countyIds) {
          var countyTerms = {
              terms: {
                  'parent.county_id': countyIds.split(',')
              }
          };
          renderedQuery.body.query.bool.filter.push(countyTerms);
      }

      if (localityIds) {
          var localityTerms = {
              terms: {
                  'parent.locality_id': localityIds.split(',')
              }
          };
          renderedQuery.body.query.bool.filter.push(localityTerms);
      }
  }
}

module.exports = filterByParentIds;
