var config = require( 'pelias-config' ).generate().esclient;
var Backend = require('geopipes-elasticsearch-backend'),
    client = require('elasticsearch').Client(config),
    backends = {};

function getBackend( index, type ){
  var key = ( index + ':' + type );
  if( !backends[key] ){
    backends[key] = new Backend( client, index, type );
  }
  return backends[key];
}

module.exports = getBackend;
