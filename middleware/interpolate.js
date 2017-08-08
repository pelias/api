const async = require('async');
const logger = require( 'pelias-logger' ).get( 'api' );
const source_mapping = require('../helper/type_mapping').source_mapping;
const _ = require('lodash');

/**
example response from interpolation web service:
{
  type: 'Feature',
  properties: {
    type: 'interpolated',
    source: 'mixed',
    number: '17',
    lat: -41.2887032,
    lon: 174.767089
  },
  geometry: {
    type: 'Point',
    coordinates: [ 174.767089, -41.2887032 ]
  }
}
**/

function setup(service, should_execute) {
  return function controller(req, res, next) {
    if (!should_execute(req, res)) {
      return next();
    }

    // bind the service to the req which doesn't change
    const req_bound_service = _.partial(service, req);

    // only interpolate the street-layer results
    // save this off into a separate array so that when docs are annotated
    //  after the interpolate results are returned, no complicated bookkeeping is needed
    const street_results = _.get(res, 'data', []).filter(result => result.layer === 'street');

    // perform interpolations asynchronously for all relevant hits
    const start = (new Date()).getTime();
    async.map(street_results, req_bound_service, (err, interpolation_results) => {
      if (err) {
        logger.error(`[middleware:interpolation] ${_.defaultTo(err.message, err)}`);
        return next();
      }

      interpolation_results.forEach((interpolation_result, idx) => {
        const source_result = street_results[idx];

        // invalid / not useful response, debug log for posterity
        // note: leave this hit unmodified
        if (!_.has(interpolation_result, 'properties')) {
          logger.debug(`[interpolation] [miss] ${req.clean.parsed_text}`);
          return;
        }

        // the interpolation service returned a valid result, debug log for posterity
        // note: we now merge those values with the existing 'street' record
        logger.debug(`[interpolation] [hit] ${req.clean.parsed_text} ${JSON.stringify(interpolation_result)}`);

        // -- metadata --
        source_result.layer = 'address';
        source_result.match_type = 'interpolated';

        // -- name --
        source_result.name.default = `${interpolation_result.properties.number} ${source_result.name.default}`;

        // -- source --
        // lookup the lowercased source, defaulting to 'mixed' when not found
        // the source mapping is a jagged string->array, so default to 'mixed' as an array
        //  to ensure that subscript works
        source_result.source = _.defaultTo(
          source_mapping[_.toLower(interpolation_result.properties.source)],
          ['mixed']
        )[0];

        // -- source_id --
        // note: interpolated values have no source_id
        delete source_result.source_id; // remove original street source_id
        if( interpolation_result.properties.hasOwnProperty( 'source_id' ) ){
          source_result.source_id = interpolation_result.properties.source_id;
        }

        // -- address_parts --
        source_result.address_parts.number = interpolation_result.properties.number;

        // -- geo --
        source_result.center_point = {
          lat: interpolation_result.properties.lat,
          lon: interpolation_result.properties.lon
        };

        // -- bbox --
        delete source_result.bounding_box;

      });

      // sort the results to ensure that addresses show up higher than street centroids
      if (_.has(res, 'data')) {
        res.data.sort((a, b) => {
          if (a.layer === 'address' && b.layer !== 'address') { return -1; }
          if (a.layer !== 'address' && b.layer === 'address') { return 1; }
          return 0;
        });
      }

      // log the execution time, continue
      logger.info( `[interpolation] [took] ${(new Date()).getTime() - start} ms`);
      next();

    });

  };

}

module.exports = setup;
