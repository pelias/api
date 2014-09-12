
var Backend = require('geopipes-elasticsearch-backend'),
    backends = {},
    client;

// set env specific client
if( process.env.NODE_ENV === 'test' ){
  client = require('./pelias-mockclient');
} else {
  client = require('pelias-esclient')();
}

function getBackend( index, type ){
  var key = ( index + ':' + type );
  if( !backends[key] ){
    backends[key] = new Backend( client, index, type );
  }
  return backends[key];
}

module.exports = getBackend;