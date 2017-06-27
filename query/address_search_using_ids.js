const peliasQuery = require('pelias-query');
const defaults = require('./search_defaults');
const logger = require('pelias-logger').get('api');
const _ = require('lodash');
const check = require('check-types');

//------------------------------
// general-purpose search query
//------------------------------
const addressUsingIdsQuery = new peliasQuery.layout.AddressesUsingIdsQuery();

// scoring boost
// addressUsingIdsQuery.score( peliasQuery.view.focus_only_function( peliasQuery.view.phrase ) );
addressUsingIdsQuery.score( peliasQuery.view.popularity_only_function );
addressUsingIdsQuery.score( peliasQuery.view.population_only_function );
// --------------------------------

// non-scoring hard filters
addressUsingIdsQuery.filter( peliasQuery.view.boundary_country );
addressUsingIdsQuery.filter( peliasQuery.view.boundary_circle );
addressUsingIdsQuery.filter( peliasQuery.view.boundary_rect );
addressUsingIdsQuery.filter( peliasQuery.view.sources );
// --------------------------------


// Red Lion, PA -- parsed as locality/state, localadmin/state, and neighbourhood/state
// Chelsea -- parsed as neighbourhood, localadmin, and locality
// Manhattan -- parsed as borough, locality, and localadmin
// Luxembourg -- parsed as country, locality, and region

// if any placeholder results are at neighbourhood, borough, locality, or localadmin layers, filter by those ids at those layers
// fallback to county
// if any placeholder results are at county or macrocounty layers, filter by those ids at those layers
// fallback to region
// if any placeholder results are at region or macroregion layers, filter by those ids at those layers
// fallback to dependency/country
// if any placeholder results are at dependency or country layers, filter by those ids at those layers


// address in Red Lion, PA -- find results at layer=address
// neighbourhood_id in [85844063, 85844067]
// locality_id in [101717221]
// localadmin_id in [404487867]
// search all of the above

// address in Chelsea
// neighbourhood_id in [85786511, 85810589, 85769021, 85890029, 85810579, 85810591, 85810575, 85772883, 420514219]
// locality_id in [85950359, 85914491, 101932747, 85951865, 101715289, 85943049, 101733697, 101722101, 101738587]
// localadmin_id in [404476575, 404508239, 404474971, 404527169, 404494675, 404503811, 404519887, 404488679, 404538119]

// address in Manhattan
// neighbourhood_id in []
// borough_id in [421205771]
// locality_id in [85945171, 85940551, 85972655]
// localadmin_id in [404502889, 404499147, 404502891, 85972655]
// search all of the above

// address in Luxembourg
// country_id in [85633275]
// region_id in [85681727, 85673875]
// locality_id in [101751765]
// search locality first, then region perhaps


// if there are locality/localadmin layers, return ['locality', 'localadmin']
// if there are region/macroregion layers, return ['region', 'macroregion']

const granularity_bands = [
  ['neighbourhood', 'borough', 'locality', 'localadmin'],
  ['county', 'macrocounty'],
  ['region', 'macroregion'],
  ['dependency', 'country']
];

function anyResultsAtGranularityBand(results, band) {
  return results.some((result) => { return _.includes(band, result.layer); });
}

function getIdsAtLayer(results, layer) {
  return results.filter((result) => { return result.layer === layer; }).map(_.property('source_id'));
}

/**
  map request variables to query variables for all inputs
  provided by this HTTP request.
**/
function generateQuery( clean, res ){
  const vs = new peliasQuery.Vars( defaults );
  const results = _.defaultTo(res.data, []);

  const logParts = ['query:address_search_using_ids', 'parser:libpostal'];

  // sources
  if( !_.isEmpty(clean.sources) ) {
    vs.var( 'sources', clean.sources);
    logParts.push('param:sources');
  }

  // size
  if( clean.querySize ) {
    vs.var( 'size', clean.querySize );
    logParts.push('param:querySize');
  }

  if( ! _.isEmpty(clean.parsed_text.number) ){
    vs.var( 'input:housenumber', clean.parsed_text.number );
  }
  vs.var( 'input:street', clean.parsed_text.street );

  const granularity_band = granularity_bands.find((band) => {
    return anyResultsAtGranularityBand(results, band);
  });

  if (granularity_band) {
    const layers_to_ids = granularity_band.reduce((acc, layer) => {
      acc[layer] = getIdsAtLayer(res.data, layer);
      return acc;
    }, {});

    vs.var('input:layers', JSON.stringify(layers_to_ids));

  }

  // focus point
  if( check.number(clean['focus.point.lat']) &&
      check.number(clean['focus.point.lon']) ){
    vs.set({
      'focus:point:lat': clean['focus.point.lat'],
      'focus:point:lon': clean['focus.point.lon']
    });
  }

  // boundary rect
  if( check.number(clean['boundary.rect.min_lat']) &&
      check.number(clean['boundary.rect.max_lat']) &&
      check.number(clean['boundary.rect.min_lon']) &&
      check.number(clean['boundary.rect.max_lon']) ){
    vs.set({
      'boundary:rect:top': clean['boundary.rect.max_lat'],
      'boundary:rect:right': clean['boundary.rect.max_lon'],
      'boundary:rect:bottom': clean['boundary.rect.min_lat'],
      'boundary:rect:left': clean['boundary.rect.min_lon']
    });
  }

  // boundary circle
  // @todo: change these to the correct request variable names
  if( check.number(clean['boundary.circle.lat']) &&
      check.number(clean['boundary.circle.lon']) ){
    vs.set({
      'boundary:circle:lat': clean['boundary.circle.lat'],
      'boundary:circle:lon': clean['boundary.circle.lon']
    });

    if( check.number(clean['boundary.circle.radius']) ){
      vs.set({
        'boundary:circle:radius': Math.round( clean['boundary.circle.radius'] ) + 'km'
      });
    }
  }

  // boundary country
  if( check.string(clean['boundary.country']) ){
    vs.set({
      'boundary:country': clean['boundary.country']
    });
  }

  // format the log parts into a single coherent string
  logger.info(logParts.map((part) => { return `[${part}]`;} ).join(' ') );

  return {
    type: 'fallback_using_ids',
    body: addressUsingIdsQuery.render(vs)
  };

}

module.exports = generateQuery;
