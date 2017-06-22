const logger = require('pelias-logger').get('coarse_reverse');
const _ = require('lodash');
const Document = require('pelias-model').Document;

// do not change order, other functionality depends on most-to-least granular order
const coarse_granularities = [
  'neighbourhood',
  'borough',
  'locality',
  'localadmin',
  'county',
  'macrocounty',
  'region',
  'macroregion',
  'dependency',
  'country'
];

// remove non-coarse layers and return what's left (or all if empty)
function getEffectiveLayers(requested_layers) {
  // remove non-coarse layers
  const non_coarse_layers_removed = _.without(requested_layers, 'venue', 'address', 'street');

  // if resulting array is empty, use all coarse granularities
  if (_.isEmpty(non_coarse_layers_removed)) {
    return coarse_granularities;
  }

  // otherwise use requested layers with non-coarse layers removed
  return non_coarse_layers_removed;

}

// drop from coarse_granularities until there's one that was requested
// this depends on coarse_granularities being ordered
function getApplicableRequestedLayers(requested_layers) {
  return _.dropWhile(coarse_granularities, (coarse_granularity) => {
    return !_.includes(requested_layers, coarse_granularity);
  });
}

//  removing non-coarse layers could leave effective_layers empty, so it's
//  important to check for empty layers here
function hasResultsAtRequestedLayers(results, requested_layers) {
  return !_.isEmpty(_.intersection(_.keys(results), requested_layers));
}

// get the most granular layer from the results by taking the head of the intersection
// of coarse_granularities (which are ordered) and the result layers
// ['neighbourhood', 'borough', 'locality'] - ['locality', 'borough'] = 'borough'
// this depends on coarse_granularities being ordered
function getMostGranularLayerOfResult(result_layers) {
  return _.head(_.intersection(coarse_granularities, result_layers));
}

// create a model.Document from what's left, using the most granular
// result available as the starting point
function synthesizeDoc(results) {
  // find the most granular layer to use as the document layer
  const most_granular_layer = getMostGranularLayerOfResult(_.keys(results));
  const id = results[most_granular_layer][0].id;

  const doc = new Document('whosonfirst', most_granular_layer, id.toString());
  doc.setName('default', results[most_granular_layer][0].name);

  // assign the administrative hierarchy
  _.keys(results).forEach((layer) => {
    doc.addParent(layer, results[layer][0].name, results[layer][0].id.toString(), results[layer][0].abbr);
  });

  // set centroid if available
  if (_.has(results[most_granular_layer][0], 'centroid')) {
    doc.setCentroid( results[most_granular_layer][0].centroid );
  }

  // set bounding box if available
  if (_.has(results[most_granular_layer][0], 'bounding_box')) {
    const parsed_bounding_box = results[most_granular_layer][0].bounding_box.split(',').map(parseFloat);
    doc.setBoundingBox({
      upperLeft: {
        lat: parsed_bounding_box[3],
        lon: parsed_bounding_box[0]
      },
      lowerRight: {
        lat: parsed_bounding_box[1],
        lon: parsed_bounding_box[2]
      }
    });

  }

  const esDoc = doc.toESDocument();
  esDoc.data._id = esDoc._id;
  esDoc.data._type = esDoc._type;
  return esDoc.data;

}

function setup(service, should_execute) {
  function controller(req, res, next) {
    // do not run controller when a request validation error has occurred
    if (!should_execute(req, res)) {
      return next();
    }

    // return a warning to the caller that boundary.circle.radius will be ignored
    if (!_.isUndefined(req.clean['boundary.circle.radius'])) {
      req.warnings.push('boundary.circle.radius is not applicable for coarse reverse');
    }

    // because coarse reverse is called when non-coarse reverse didn't return
    //  anything, treat requested layers as if it didn't contain non-coarse layers
    const effective_layers = getEffectiveLayers(req.clean.layers);

    const centroid = {
      lat: req.clean['point.lat'],
      lon: req.clean['point.lon']
    };

    service(req, (err, results) => {
      // if there's an error, log it and bail
      if (err) {
        logger.info(`[controller:coarse_reverse][error]`);
        logger.error(err);
        return next();
      }

      // log how many results there were
      logger.info(`[controller:coarse_reverse][queryType:pip][result_count:${_.size(results)}]`);

      // now keep everything from the response that is equal to or less granular
      // than the most granular layer requested.  that is, if effective_layers=['county'],
      // remove neighbourhoods, boroughs, localities, localadmins
      const applicable_results = _.pick(results, getApplicableRequestedLayers(effective_layers));

      res.meta = {};
      res.data = [];

      // if there's a result at the requested layer(s), synthesize a doc from results
      if (hasResultsAtRequestedLayers(applicable_results, effective_layers)) {
        res.data.push(synthesizeDoc(applicable_results));
      }

      return next();

    });

  }

  return controller;

}

module.exports = setup;
