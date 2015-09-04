var isObject = require('is-object');
var sources_map = require( '../query/sources' );
var all_sources = Object.keys(sources_map);

function sanitize( req ) {
  req.clean = req.clean || {};
  var params = req.query;

  req.clean.types = req.clean.types || {};

  // ensure the input params are a valid object
  if( !isObject( params ) ){
    params = {};
  }

  // default case (no layers specified in GET params)
  // don't even set the from_layers key in this case
  if('string' !== typeof params.source || !params.source.length){
    return { error: false };
  }

  var sources = params.source.split(',');

  var invalid_sources = sources.filter(function(source) {
    return all_sources.indexOf(source) === -1;
  });

  if (invalid_sources.length > 0) {
    return {
      error: true,
      msg: '`' + invalid_sources[0] + '` is an invalid source parameter. Valid options: ' + all_sources.join(', ')
    };
  }

  var types = sources.reduce(function(acc, source) {
    return acc.concat(sources_map[source]);
  }, []);

  req.clean.types.from_source = types;

  return { error: false };
}

module.exports = sanitize;
