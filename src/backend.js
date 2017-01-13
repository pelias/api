const config = require( 'pelias-config' ).generate().esclient;
const client = require('elasticsearch').Client(config);

module.exports = {
  client: client
};
