const config = require( 'pelias-config' ).generate().esclient;
const Backend = require('geopipes-elasticsearch-backend');
const client = require('elasticsearch').Client(config);

module.exports = new Backend(client);
