function filterByTariffZones(req, renderedQuery) {
  if (!req || !req.query) {
      return;
  }
  if (!renderedQuery || !renderedQuery.body || !renderedQuery.body.query || !renderedQuery.body.query.bool) {
      return;
  }
  var tariffZoneIds = req.query.tariff_zone_ids;
  var tariffZoneAuthorities = req.query.tariff_zone_authorities;
  if (tariffZoneIds || tariffZoneAuthorities) {
      if (!renderedQuery.body.query.bool.filter) {
          renderedQuery.body.query.bool.filter = [];
      }

      if (tariffZoneIds) {
          var tariffZoneIdsTerms = {
              terms: {
                  'tariff_zones': tariffZoneIds.split(',')
              }
          };
          renderedQuery.body.query.bool.filter.push(tariffZoneIdsTerms);
      }

      if (tariffZoneAuthorities) {
          var tariffZoneAuthoritiesTerms = {
              terms: {
                  'tariff_zone_authorities': tariffZoneAuthorities.split(',')
              }
          };
          renderedQuery.body.query.bool.filter.push(tariffZoneAuthoritiesTerms);
      }
  }
}

module.exports = filterByTariffZones;