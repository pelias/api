const TypeMapping = require('./TypeMapping');

// instantiate a new type mapping
var tm = new TypeMapping();
tm.load();

// export singleton
module.exports = tm;
