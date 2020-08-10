const _ = require('lodash');
const peliasQuery = require('pelias-query');
const defaults = require('./search_defaults');
const restrictIds = require('./view/restrict_ids');

//------------------------------
// general-purpose search query
//------------------------------
const addressUsingIdsQuery = new peliasQuery.layout.AddressesUsingIdsQuery();

// scoring boost
addressUsingIdsQuery.score( peliasQuery.view.focus_only_function( ) );
// --------------------------------

// debugging
addressUsingIdsQuery.filter( restrictIds );
// --------------------------------

// non-scoring hard filters
addressUsingIdsQuery.filter( peliasQuery.view.boundary_country );
addressUsingIdsQuery.filter( peliasQuery.view.boundary_circle );
addressUsingIdsQuery.filter( peliasQuery.view.boundary_rect );
addressUsingIdsQuery.filter( peliasQuery.view.sources );
addressUsingIdsQuery.filter( peliasQuery.view.boundary_gid );
addressUsingIdsQuery.filter( peliasQuery.view.layers );
// --------------------------------

// This query is a departure from traditional Pelias queries where textual
// names of admin areas were looked up.  This query uses the ids returned by
// placeholder for lookups which dramatically reduces the amount of information
// that ES has to store and allows us to have placeholder handle altnames on
// behalf of Pelias.
//
// For the happy path, an input like '30 West 26th Street, Manhattan' would result
// in:
// neighbourhood_id in []
// borough_id in [421205771]
// locality_id in [85945171, 85940551, 85972655]
// localadmin_id in [404502889, 404499147, 404502891, 85972655]
//
// Where the ids are for all the various Manhattans.  Each of those could
// conceivably be the Manhattan that the user was referring to so so all must be
// queried for at the same time.
//
// A counter example for this is '1 West Market Street, York, PA' where York, PA
// can be interpreted as a locality OR county.  From experience, when there's
// ambiguity between locality and county for an input, the user is, with complete
// metaphysical certitude, referring to the city.  If they were referring to the
// county, they would have entered 'York County, PA'.  The point is that it's
// insufficient to just query for all ids because, in this case, '1 West Market Street'
// in other cities in York County, PA would be returned and would be both jarring
// to the user and almost certainly leads to incorrect results.  For example,
// the following could be returned (all are towns in York County, PA):
// - 1 West Market Street, Dallastown, PA
// - 1 West Market Street, Fawn Grove, PA
// - 1 West Market Street, Shrewsbury, PA
// etc.
//
// To avoid this calamitous response, this query takes the approach of
// "granularity bands".  That is, if there are any ids in the first set of any
// of these granularities:
// - neighbourhood
// - borough
// - locality
// - localadmin
// - region
// - macroregion
// - dependency
// - country
//
// then query for all ids in only those layers.  Falling back, if there are
// no ids in those layers, query for the county/macrocounty layers.
//
// This methodology ensures that no happened-to-match-on-county results are returned.
//
// The decision was made to include all other layers in one to solve the issue
// where a country and city share a name, such as Mexico, which could be
// interpreted as a country AND city (in Missouri).  The data itself will sort
// out which is correct.  That is, it's unlikely that "11 Rock Springs Dr" exists
// in Mexico the country due to naming conventions and would be filtered out
// (though it could, but that's good because it's legitimate)

const granularity_bands = [
  ['neighbourhood', 'borough', 'locality', 'localadmin', 'region', 'macroregion', 'dependency', 'country'],
  ['county', 'macrocounty']
];

// returns IFF there are *any* results in the granularity band
function anyResultsAtGranularityBand(results, band) {
  return results.some(result => _.includes(band, result.layer));
}

// returns the ids of results at the requested layer
function getIdsAtLayer(results, layer) {
  return results.filter(result => result.layer === layer).map(_.property('source_id'));
}

/**
  map request variables to query variables for all inputs
  provided by this HTTP request.  This function operates on res.data which is the
  Document-ified placeholder repsonse.
**/
function generateQuery( clean, res ){
  const vs = new peliasQuery.Vars( defaults );
  const results = _.defaultTo(res.data, []);

  // sources
  if( !_.isEmpty(clean.sources) ) {
    vs.var( 'sources', clean.sources);
  }

  // layers
  if (_.isArray(clean.layers) && !_.isEmpty(clean.layers) ){
    vs.var( 'layers', clean.layers);
  }

  // size
  if( clean.querySize ) {
    vs.var( 'size', clean.querySize );
  }

  if( ! _.isEmpty(clean.parsed_text.housenumber) ){
    vs.var( 'input:housenumber', clean.parsed_text.housenumber );
  }

  if( ! _.isEmpty(clean.parsed_text.unit) ){
    vs.var( 'input:unit', clean.parsed_text.unit );
  }

  if( ! _.isEmpty(clean.parsed_text.postalcode) ){
    vs.var( 'input:postcode', clean.parsed_text.postalcode );
  }

  vs.var( 'input:street', clean.parsed_text.street );

  // find the first granularity band for which there are results
  const granularity_band = granularity_bands.find(band => anyResultsAtGranularityBand(results, band));

  // if there's a granularity band, accumulate the ids from each layer in the band
  // into an object mapping layer->ids of those layers
  if (granularity_band) {
    const layers_to_ids = granularity_band.reduce((acc, layer) => {
      acc[layer] = getIdsAtLayer(res.data, layer);
      return acc;
    }, {});

    // use an object here instead of calling `set` since that flattens out an
    // object into key/value pairs and makes identifying layers harder in query module
    vs.var('input:layers', layers_to_ids);

  }

  // focus point
  if( _.isFinite(clean['focus.point.lat']) &&
      _.isFinite(clean['focus.point.lon']) ){
    vs.set({
      'focus:point:lat': clean['focus.point.lat'],
      'focus:point:lon': clean['focus.point.lon']
    });
  }

  // boundary rect
  if( _.isFinite(clean['boundary.rect.min_lat']) &&
      _.isFinite(clean['boundary.rect.max_lat']) &&
      _.isFinite(clean['boundary.rect.min_lon']) &&
      _.isFinite(clean['boundary.rect.max_lon']) ){
    vs.set({
      'boundary:rect:top': clean['boundary.rect.max_lat'],
      'boundary:rect:right': clean['boundary.rect.max_lon'],
      'boundary:rect:bottom': clean['boundary.rect.min_lat'],
      'boundary:rect:left': clean['boundary.rect.min_lon']
    });
  }

  // boundary circle
  if( _.isFinite(clean['boundary.circle.lat']) &&
      _.isFinite(clean['boundary.circle.lon']) ){
    vs.set({
      'boundary:circle:lat': clean['boundary.circle.lat'],
      'boundary:circle:lon': clean['boundary.circle.lon']
    });

    if( _.isFinite(clean['boundary.circle.radius']) ){
      vs.set({
        'boundary:circle:radius': Math.round( clean['boundary.circle.radius'] ) + 'km'
      });
    }
  }

  // boundary country
  if( _.isArray(clean['boundary.country']) && !_.isEmpty(clean['boundary.country']) ){
    vs.set({
      'boundary:country': clean['boundary.country'].join(' ')
    });
  }

  // boundary gid
  if ( _.isString(clean['boundary.gid']) ){
    vs.set({
      'boundary:gid': clean['boundary.gid']
    });
  }

  // restrictIds for debugging/explaining
  if (clean.restrictIds) {
    vs.var('restrictIds', clean.restrictIds);
  }

  return {
    type: 'address_search_using_ids',
    body: addressUsingIdsQuery.render(vs)
  };

}

module.exports = generateQuery;
