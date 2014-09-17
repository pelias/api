var logger = require('../src/logger');

// Build pelias search query
function generate( params ){
  
  var cmd = {
    "query": {
      "query_string": {
        "query": params.input,
        "fields": ['name.default'],
        "default_operator": 'OR'
      }
    },
    "size": 30
  };

  logger.log( 'cmd', JSON.stringify( cmd, null, 2 ) );
  return cmd;

}

module.exports = generate;