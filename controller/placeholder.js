const _ = require('lodash');
const logger = require('pelias-logger').get('api');
const Document = require('pelias-model').Document;
const geolib = require('geolib');

// composition of toNumber and isFinite, useful for single call to convert a value
//  to a number, then checking to see if it's finite
function isFiniteNumber(value) {
  return !_.isEmpty(_.trim(value)) && _.isFinite(_.toNumber(value));
}

// returns true if value is parseable as finite non-negative number
function isNonNegativeFiniteNumber(value) {
  return isFiniteNumber(value) && _.gte(value, 0);
}

function hasLatLon(result) {
  return _.isFinite(_.get(result.geom, 'lat')) && _.isFinite(_.get(result.geom, 'lon'));
}

function getLatLon(result) {
  return {
    latitude: result.geom.lat,
    longitude: result.geom.lon
  };
}

// if geom.lat/lon are parseable as finite numbers, convert to a finite number
// otherwise remove the field
function numberifyGeomLatLon(result) {
  ['lat', 'lon'].forEach((f) => {
    if (isFiniteNumber(_.get(result.geom, f))) {
      result.geom[f] = _.toFinite(result.geom[f]);
    } else {
      // result.geom may not exist, so use unset instead of delete
      _.unset(result.geom, f);
    }
  });

  return result;

}

// returns true if all 4 ,-delimited (max) substrings are parseable as finite numbers
// '12.12,21.21,13.13,31.31'       returns true
// '12.12,21.21,13.13,31.31,14.14' returns false
// '12.12,21.21,13.13,blah'        returns false
// '12.12,21.21,13.13,31.31,blah'  returns false
// '12.12,NaN,13.13,31.31'         returns false
// '12.12,Infinity,13.13,31.31'    returns false
function is4CommaDelimitedNumbers(bbox) {
  return _.defaultTo(bbox, '').
    split(',').
    filter(isFiniteNumber).length === 4;
}

function hasName(result) {
  return !_.isEmpty(_.trim(result.name));
}

// filter that passes only results that match on requested layers
function getLayersFilter(clean) {
  // passes everything if:
  // - req.clean.layers is empty
  // - req.clean.parsed_text.street is available
  if (_.isEmpty(_.get(clean, 'layers', [])) || _.has(clean, ['parsed_text', 'street'])) {
    return () => true;
  }

  // otherwise return a function that checks for set inclusion of a result placetype
  return (result) => _.includes(clean.layers, result.placetype);

}

// return true if the hierarchy does not have a country.abbr
// OR hierarchy country.abbr matches boundary.country
function matchesBoundaryCountry(boundaryCountry, hierarchy) {
  return !boundaryCountry || _.get(hierarchy, 'country.abbr') === boundaryCountry;
}

// return true if the result does not have a lineage
// OR at least one lineage matches the requested boundary.country
function atLeastOneLineageMatchesBoundaryCountry(boundaryCountry, result) {
  return !result.lineage || result.lineage.some(_.partial(matchesBoundaryCountry, boundaryCountry));
}

// return a function that detects if a result has at least one lineage in boundary.country
function getBoundaryCountryFilter(clean, do_geometric_filters_apply) {
  if ( do_geometric_filters_apply && _.has(clean, 'boundary.country') ) {
    return _.partial(atLeastOneLineageMatchesBoundaryCountry, clean['boundary.country']);
  }

  // there's no boundary.country filter, so return a function that always returns true
  return () => true;

}

// return a function that detects if a result is inside a bbox if a bbox is available
function getBoundaryRectangleFilter(clean, do_geometric_filters_apply) {
  // check to see if boundary.rect.min_lat/min_lon/max_lat/max_lon are all available
  if (do_geometric_filters_apply && ['min_lat', 'min_lon', 'max_lat', 'max_lon'].every((f) => {
    return _.has(clean, `boundary.rect.${f}`);
  })) {
    const polygon = [
      { latitude: clean['boundary.rect.min_lat'], longitude: clean['boundary.rect.min_lon'] },
      { latitude: clean['boundary.rect.max_lat'], longitude: clean['boundary.rect.min_lon'] },
      { latitude: clean['boundary.rect.max_lat'], longitude: clean['boundary.rect.max_lon'] },
      { latitude: clean['boundary.rect.min_lat'], longitude: clean['boundary.rect.max_lon'] }
    ];
    // isPointInside takes polygon last, so create a function that has it pre-populated
    const isPointInsidePolygon = _.partialRight(geolib.isPointInside, polygon);

    return _.partial(isInsideGeometry, isPointInsidePolygon);

  }

  // there's no bbox filter, so return a function that always returns true
  return () => true;

}

// return a function that detects if a result is inside a circle if a circle is available
function getBoundaryCircleFilter(clean, do_geometric_filters_apply) {
  // check to see if boundary.circle.lat/lon/radius are all available
  if (do_geometric_filters_apply && ['lat', 'lon', 'radius'].every((f) => {
    return _.has(clean, `boundary.circle.${f}`);
  })) {
    const center = {
      latitude: clean['boundary.circle.lat'],
      longitude: clean['boundary.circle.lon']
    };
    const radiusInMeters = clean['boundary.circle.radius'] * 1000;

    // isPointInCircle takes circle/radius last, so create a function that has them pre-populated
    const isPointInCircle = _.partialRight(geolib.isPointInCircle, center, radiusInMeters);

    return _.partial(isInsideGeometry, isPointInCircle);

  }

  // there's no circle filter, so return a function that always returns true
  return () => true;

}

// helper that calls an "is inside some geometry" function
function isInsideGeometry(f, result) {
  return hasLatLon(result) ? f(getLatLon(result)) : false;
}

// returns true if hierarchyElement has both name and id
function placetypeHasNameAndId(hierarchyElement) {
  return !_.isEmpty(_.trim(hierarchyElement.name)) &&
          !_.isEmpty(_.trim(hierarchyElement.id));
}

// synthesize an ES doc from a placeholder result
function synthesizeDocs(boundaryCountry, result) {
  const doc = new Document('whosonfirst', result.placetype, result.id.toString());
  doc.setName('default', result.name);

  // only assign centroid if both lat and lon are finite numbers
  if (hasLatLon(result)) {
    doc.setCentroid( { lat: result.geom.lat, lon: result.geom.lon } );
  } else {
    logger.error(`could not parse centroid for id ${result.id}`);
  }

  // _.conformsTo verifies that an object property has a certain format
  if (_.conformsTo(result.geom, { 'bbox': is4CommaDelimitedNumbers } )) {
    const parsedBoundingBox = result.geom.bbox.split(',').map(_.toFinite);
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
    logger.error(`could not parse bbox for id ${result.id}: ${_.get(result, 'geom.bbox')}`);
  }

  // set population and popularity if parseable as finite number
  if (isNonNegativeFiniteNumber(result.population)) {
    doc.setPopulation(_.toFinite(result.population));
  }
  if (isNonNegativeFiniteNumber(result.popularity)) {
    doc.setPopularity(_.toFinite(result.popularity));
  }

  _.defaultTo(result.lineage, [])
    // remove all lineages that don't match an explicit boundary.country
    .filter(_.partial(matchesBoundaryCountry, boundaryCountry))
    // add all the lineages to the doc
    .map((hierarchy) => {
      Object.keys(hierarchy)
        .filter(doc.isSupportedParent)
        .filter((placetype) => {
          return placetypeHasNameAndId(hierarchy[placetype]);
        })
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

function setup(placeholderService, do_geometric_filters_apply, should_execute) {
  function controller( req, res, next ){
    // bail early if req/res don't pass conditions for execution
    if (!should_execute(req, res)) {
      return next();
    }

    placeholderService(req, (err, results) => {
      if (err) {
        // push err.message or err onto req.errors
        req.errors.push( _.get(err, 'message', err));

      } else {
        const boundaryCountry = do_geometric_filters_apply ? _.get(req, ['clean', 'boundary.country']) : undefined;

        // convert results to ES docs
        // boundary.country filter must happen after synthesis since multiple
        //  lineages may produce different country docs
        res.meta = {
          query_type: 'fallback'
        };

        res.data = results
                    // filter out results that don't have a name
                    .filter(hasName)
                    // filter out results that don't match on requested layer(s)
                    .filter(getLayersFilter(req.clean))
                    // filter out results that don't match on any lineage country
                    .filter(getBoundaryCountryFilter(req.clean, do_geometric_filters_apply))
                    // clean up geom.lat/lon for boundary rect/circle checks
                    .map(numberifyGeomLatLon)
                    // filter out results that aren't in the boundary.rect
                    .filter(getBoundaryRectangleFilter(req.clean, do_geometric_filters_apply))
                    // filter out results that aren't in the boundary.circle
                    .filter(getBoundaryCircleFilter(req.clean, do_geometric_filters_apply))
                    // convert results to ES docs
                    .map(_.partial(synthesizeDocs, boundaryCountry));

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
