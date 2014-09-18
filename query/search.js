var logger = require('../src/logger');

// Build pelias search query
function generate( params ){
  
  var cmd = {
    "query":{
      "filtered" : {
        "query" : {
            "match" : {
              "name.default": params.input
            }
        },
        "filter" : {
            "geo_distance" : {
                "distance" : "200km",
                "center_point" : {
                  "lat": params.lat, 
                  "lon": params.lon 
                }
            }
        }
      }
    },
    "size": params.size
  };

  logger.log( 'cmd', JSON.stringify( cmd, null, 2 ) );
  return cmd;

}

module.exports = generate;