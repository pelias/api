
var logger = require('../src/logger'),
    queries = require('geopipes-elasticsearch-backend').queries;

function generate( params ){

  var query = {
    'query': {
      'filtered': {
        'query': {
          'match_all': {}
        },
        'filter' : {
          'bool': {
            'must': []
          }
        }
      }
    },
    'size': params.size
  };

  // TODO: DRY (the following lines are repeated here and in geopipes-elasticsearchbackend)
  // query/geo_bbox - cleanup necessary #techdebt
  if (params.bbox) {
    var options = {
      top   : Number( params.bbox.top ).toFixed(2),   // @note: make filter cachable
      right : Number( params.bbox.right ).toFixed(2), // precision max ~1.113km off
      bottom: Number( params.bbox.bottom ).toFixed(2),
      left  : Number( params.bbox.left ).toFixed(2),
      size: params.size || 1,
      field: params.field || 'center_point'
    };
    var filter = {
      'geo_bounding_box' : {
        '_cache': true // Speed up duplicate queries. Memory impact?
      }
    };

    filter.geo_bounding_box[ options.field ] = {
      'top'   : options.top,
      'right' : options.right,
      'bottom': options.bottom,
      'left'  : options.left,
    };
    query.query.filtered.filter.bool.must.push( filter );
  }

  if ( params.lat && params.lon ){
    var centroid = {
      lat: params.lat,
      lon: params.lon
    };
    query = queries.distance( centroid, { size: params.size } );
    if (params.bbox) {
      query = queries.bbox ( centroid, { size: params.size, bbox: params.bbox } );
    }
  }
  

  // add search condition to distance query
  query.query.filtered.query = {
    query_string : {
      query: params.input,
      fields: ['name.default'],
      default_operator: 'OR'
    }
  };

  return query;
}

module.exports = generate;