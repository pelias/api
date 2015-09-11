var isObject = require('is-object');
var sources_map = require( '../query/sources' );

function sanitize( req ) {
  var params = req.query || {};

  req.clean = req.clean || {};
  req.clean.types = req.clean.types || {};

  // default case (no sources specified in GET params)
  if (params.hasOwnProperty('sources') === false) {
    return { error: false };
  }

  params.sources = params.sources.trim();

  if (params.sources.trim().length === 0) {
    return {
      error: true,
      message: '`sources` parameter cannot be an empty string. Valid options: ' + Object.keys(sources_map).join(', ')
    };
  }

  var sources = params.sources.split(',');

  var invalid_sources = sources.filter(function(source) {
    return sources_map.hasOwnProperty(source) === false;
  });

  if (invalid_sources.length > 0) {
    return {
      error: true,
      message: '`' + invalid_sources[0] + '` is an invalid source parameter. Valid options: ' + Object.keys(sources_map).join(', ')
    };
  }

  req.clean.types.from_sources = sources.reduce(function(acc, source) {
    return acc.concat(sources_map[source]);
  }, []);

  return { error: false };
}

module.exports = sanitize;
