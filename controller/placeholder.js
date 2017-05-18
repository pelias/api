const _ = require('lodash');
const logger = require('pelias-logger').get('api');
const Document = require('pelias-model').Document;

// composition of toNumber and isFinite, useful for single call to convert a value
//  to a number, then checking to see if it's finite
const isFiniteNumber = _.flow(_.toNumber, _.isFinite);
const isNonNegativeFiniteNumber = _.flow(_.toNumber, (val) => { return val >= 0; });

// returns true if all 4 ,-delimited (max) substrings are parseable as finite numbers
// '12.12,21.21,13.13,31.31'       returns true
// '12.12,21.21,13.13,31.31,14.14' returns false
// '12.12,21.21,13.13,blah'        returns false
// '12.12,21.21,13.13,31.31,blah'  returns false
// '12.12,NaN,13.13,31.31'         returns false
// '12.12,Infinity,13.13,31.31'    returns false
function is4CommaDelimitedNumbers(bbox) {
  return bbox.
    split(',').
    filter(isFiniteNumber).length === 4;
}

function hasName(result) {
  return !_.isEmpty(_.trim(result.name));
}

// return true if the hierarchy does not have a country.abbr
// OR hierarchy country.abbr matches boundary.country
function matchesBoundaryCountry(boundaryCountry, hierarchy) {
  return !boundaryCountry || _.get(hierarchy, 'country.abbr') === boundaryCountry;
}

// return true if the result does not have a lineage
// OR at least one lineage matches the requested boundary.country
function atLeastOneLineageMatchesBoundaryCountry(boundaryCountry, result) {
  return !result.lineage || result.lineage.some(_.curry(matchesBoundaryCountry)(boundaryCountry));
}

function synthesizeDocs(boundaryCountry, result) {
  const doc = new Document('whosonfirst', result.placetype, result.id.toString());
  doc.setName('default', result.name);

  // only assign centroid if both lat and lon are finite numbers
  if (_.conformsTo(result.geom, { 'lat': isFiniteNumber, 'lon': isFiniteNumber } )) {
    doc.setCentroid( { lat: result.geom.lat, lon: result.geom.lon } );
  } else {
    logger.error(`could not parse centroid for id ${result.id}`);
  }

  // lodash conformsTo verifies that an object has a property with a certain format
  if (_.conformsTo(result.geom, { 'bbox': is4CommaDelimitedNumbers } )) {
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
  } else {
    logger.error(`could not parse bbox for id ${result.id}: ${result.geom.bbox}`);
  }

  if (_.conformsTo(result, { 'population': isNonNegativeFiniteNumber })) {
    doc.setPopulation(_.toNumber(result.population));
  }

  if (_.conformsTo(result, { 'popularity': isNonNegativeFiniteNumber })) {
    doc.setPopularity(_.toNumber(result.popularity));
  }

  _.defaultTo(result.lineage, [])
    // remove all lineages that don't match an explicit boundary.country
    .filter(_.curry(matchesBoundaryCountry)(boundaryCountry))
    // add all the lineages to the doc
    .map((hierarchy) => {
      Object.keys(hierarchy)
        .filter(doc.isSupportedParent)
        .filter((placetype) => { return !_.isEmpty(_.trim(hierarchy[placetype].name)); } )
        .forEach((placetype) => {
          doc.addParent(
            placetype,
            hierarchy[placetype].name,
            hierarchy[placetype].id.toString(),
            hierarchy[placetype].abbr);
      });
    });

  return buildESDoc(doc);

}

function buildESDoc(doc) {
  const esDoc = doc.toESDocument();
  return _.extend(esDoc.data, { _id: esDoc._id, _type: esDoc._type });
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
        // filter that passes only results that match on requested layers
        // passes everything if req.clean.layers is not found
        const matchesLayers = (result) => {
          return _.includes(req.clean.layers, result.placetype);
        };
        const layersFilter = _.get(req, 'clean.layers', []).length ?
          matchesLayers : _.constant(true);

        // filter that passes only documents that match on boundary.country
        // passed everything if req.clean['boundary.country'] is not found
        const boundaryCountry = _.get(req, ['clean', 'boundary.country']);
        const boundaryCountryFilter = !!boundaryCountry ?
          _.curry(atLeastOneLineageMatchesBoundaryCountry)(boundaryCountry) : _.constant(true);

        // convert results to ES docs
        // boundary.country filter must happen after synthesis since multiple
        //  lineages may produce different country docs
        res.meta = {};
        res.data = results
                    .filter(hasName)
                    .filter(layersFilter)
                    // filter out results that don't match on any lineage country
                    .filter(boundaryCountryFilter)
                    .map(_.curry(synthesizeDocs)(boundaryCountry));

        const messageParts = [
          '[controller:placeholder]',
          `[result_count:${_.defaultTo(res.data, []).length}]`
        ];

        logger.info(messageParts.join(' '));
      }

      return next();
    });

  }

  return controller;
}

module.exports = setup;
