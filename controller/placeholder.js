'use strict';

const _ = require('lodash');

const logger = require('pelias-logger').get('api');
const logging = require( '../helper/logging' );
const Document = require('pelias-model').Document;

// returns true if all 4 ,-delimited (max) substrings are parseable as numbers
// '12.12,21.21,13.13,31.31'       returns true
// '12.12,21.21,13.13,blah'        returns false
// '12.12,21.21,13.13,31.31,blah'  returns false
function validBoundingBox(bbox) {
  return bbox.
    split(',').
    map(_.toNumber).
    filter(_.isFinite).length === 4;
}

function synthesizeDocs(result) {
  const doc = new Document('whosonfirst', result.placetype, result.id.toString());
  doc.setName('default', result.name);

  // only assign centroid if both lat and lon are finite numbers
  if (_.conformsTo(result.geom, { 'lat': _.isFinite, 'lon': _.isFinite } )) {
    doc.setCentroid( { lat: result.geom.lat, lon: result.geom.lon } );
  }

  // lodash conformsTo verifies that an object has a property with a certain format
  if (_.conformsTo(result.geom, { 'bbox': validBoundingBox } )) {
    const parsedBoundingBox = result.geom.bbox.split(',').map(_.toNumber);
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

  if (_.isEmpty(result.lineage)) {
    // there are no hierarchies so just return what's been assembled so far
    const esDoc = doc.toESDocument();
    esDoc.data._id = esDoc._id;
    esDoc.data._type = esDoc._type;

    return esDoc.data;

  } else {
    return result.lineage.map((hierarchy) => {
      // clear out the effects of the last hierarchy array (this effectively clones the base Document)
      doc.clearAlpha3().clearAllParents();

      Object.keys(hierarchy)
        .filter(doc.isSupportedParent)
        .filter((placetype) => { return !_.isEmpty(_.trim(hierarchy[placetype].name)); } )
        .forEach((placetype) => {
          if (hierarchy[placetype].hasOwnProperty('abbr') && placetype === 'country') {
            doc.setAlpha3(hierarchy[placetype].abbr);
          }

          doc.addParent(
            placetype,
            hierarchy[placetype].name,
            hierarchy[placetype].id.toString(),
            hierarchy[placetype].abbr);

      });

      const esDoc = doc.toESDocument();
      esDoc.data._id = esDoc._id;
      esDoc.data._type = esDoc._type;

      return esDoc.data;

    });

  }
}

function setup(placeholderService, should_execute) {
  function controller( req, res, next ){
    // bail early if req/res don't pass conditions for execution
    if (!should_execute(req, res)) {
      return next();
    }

    placeholderService(req, (err, results) => {
      if (err) {
        // bubble up an error if one occurred
        if (_.isObject(err) && err.message) {
          req.errors.push( err.message );
        } else {
          req.errors.push( err );
        }

      } else {
        const matchesLayers = (result) => {
          return req.clean.layers.indexOf(result.placetype) >= 0;
        };

        // filter that passes only results that match on requested layers
        // passes everything if req.clean.layers is not found
        const layersFilter = _.get(req, 'clean.layers', []).length ? matchesLayers : _.constant(true);

        // otherwise convert results to ES docs
        res.meta = {};
        res.data = _.flatten(results.filter(layersFilter).map(synthesizeDocs));
      }

      return next();
    });

  }

  return controller;
}

module.exports = setup;
