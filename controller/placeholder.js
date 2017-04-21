'use strict';

const _ = require('lodash');

const logger = require('pelias-logger').get('api');
const logging = require( '../helper/logging' );
const Document = require('pelias-model').Document;

const boundingBoxRegex = /^-?\d+\.\d+,-?\d+\.\d+,-?\d+\.\d+,-?\d+\.\d+$/;

function validBoundingBox(bbox) {
  return boundingBoxRegex.test(bbox);
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
    const parsedBoundingBox = result.geom.bbox.split(',').map(parseFloat);
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
    if (!should_execute(req, res)) {
      return next();
    }

    placeholderService.search(req.clean.text, req.clean.lang.iso6393, logging.isDNT(req), (err, results) => {
      if (err) {
        if (_.isObject(err) && err.message) {
          req.errors.push( err.message );
        } else {
          req.errors.push( err );
        }

      } else {
        res.meta = {};
        res.data = _.flatten(results.map((result) => {
          if (_.isEmpty(result.lineage)) {
            return synthesizeDocs(result);
          }

          return synthesizeDocs(result);
        }));
      }

      return next();
    });

  }

  return controller;
}

module.exports = setup;
