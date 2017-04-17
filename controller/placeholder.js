'use strict';

const _ = require('lodash');

const logger = require('pelias-logger').get('api');
const logging = require( '../helper/logging' );
const Document = require('pelias-model').Document;

function synthesizeDocs(result) {
  return result.lineage.map((hierarchy) => {
    const doc = new Document('whosonfirst', result.placetype, result.id.toString());
    doc.setName('default', result.name);
    doc.setCentroid( { lat: result.geom.lat, lon: result.geom.lon } );

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

function setup(placeholderService, should_execute) {
  function controller( req, res, next ){
    if (!should_execute(req, res)) {
      return next();
    }

    placeholderService.search(req.clean.text, req.clean.lang.iso6393, (err, results) => {
      res.meta = {};
      res.data = _.flatten(results.map((result) => {
        return synthesizeDocs(result);
      }));

      return next();
    });

  }

  return controller;
}

module.exports = setup;
