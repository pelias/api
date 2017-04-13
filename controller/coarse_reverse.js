const logger = require('pelias-logger').get('coarse_reverse');
const _ = require('lodash');
const Document = require('pelias-model').Document;

const granularities = [
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

function getMostGranularLayer(results) {
  return granularities.find((granularity) => {
    return results.hasOwnProperty(granularity);
  });
}

function hasResultsAtRequestedLayers(results, layers) {
  return _.intersection(layers, Object.keys(results)).length > 0;
}

function synthesizeDoc(results) {
  // now create a model.Document from what's level, using the most granular
  // result available as the starting point
  // the immediately above cannot be re-used since county may be the most
  // granular layer requested but the results may start at region (no county found)
  const most_granular_layer = getMostGranularLayer(results);
  const id = results[most_granular_layer][0].id;

  const doc = new Document('whosonfirst', most_granular_layer, id.toString());
  doc.setName('default', results[most_granular_layer][0].name);

  if (results[most_granular_layer][0].hasOwnProperty('centroid')) {
    doc.setCentroid( results[most_granular_layer][0].centroid );
  }

  if (results[most_granular_layer][0].hasOwnProperty('bounding_box')) {
    const parsedBoundingBox = results[most_granular_layer][0].bounding_box.split(',').map(parseFloat);
    doc.setBoundingBox({
      upperLeft: {
        lat: parsedBoundingBox[3],
        lon: parsedBoundingBox[0]
      },
      lowerRight: {
        lat: parsedBoundingBox[1],
        lon: parsedBoundingBox[2]
      }
    });

  }

  if (_.has(results, 'country[0].abbr')) {
    doc.setAlpha3(results.country[0].abbr);
  }

  // assign the administrative hierarchy
  Object.keys(results).forEach((layer) => {
    if (results[layer][0].hasOwnProperty('abbr')) {
      doc.addParent(layer, results[layer][0].name, results[layer][0].id.toString(), results[layer][0].abbr);
    } else {
      doc.addParent(layer, results[layer][0].name, results[layer][0].id.toString());
    }

  });

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

    const centroid = {
      lat: req.clean['point.lat'],
      lon: req.clean['point.lon']
    };

    service(centroid, (err, results) => {
      // if there's an error, log it and bail
      if (err) {
        logger.error(err);
        return next();
      }

      // find the finest granularity requested
      const finest_granularity_requested = granularities.findIndex((granularity) => {
        return req.clean.layers.indexOf(granularity) !== -1;
      });

      // now remove everything from the response that is more granular than the
      // most granular layer requested.  that is, if req.clean.layers=['county'],
      // remove neighbourhoods, localities, and localadmins
      Object.keys(results).forEach((layer) => {
        if (granularities.indexOf(layer) < finest_granularity_requested) {
          delete results[layer];
        }
      });

      res.meta = {};
      res.data = [];
      // synthesize a doc from results if there's a result at the request layer(s)
      if (hasResultsAtRequestedLayers(results, req.clean.layers)) {
        res.data.push(synthesizeDoc(results));
      }

      return next();

    });

  }

  return controller;

}

module.exports = setup;
