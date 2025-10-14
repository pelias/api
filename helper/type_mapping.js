const TypeMapping = require('./TypeMapping');

// instantiate a singleton type mapping
// loading normal defaults from pelias-config happens now
// updating that config from Search Client(Elasticsearch or OpenSearch) happens later
// before the webserver is started
var tm = new TypeMapping();
tm.loadFromConfig();

// export singleton
module.exports = tm;
