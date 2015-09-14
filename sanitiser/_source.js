
var check = require('check-types'),
    sources_map = require( '../query/sources' );

var ALL_SOURCES = Object.keys(sources_map),
    ALL_SOURCES_JOINED = ALL_SOURCES.join(',');

function sanitize( unclean, clean ) {

  // error & warning messages
  var messages = { errors: [], warnings: [] };

  // init clean.types (if not already init)
  clean.types = clean.types || {};

  // default case (no layers specified in GET params)
  // don't even set the from_layers key in this case
  if( check.unemptyString( unclean.source ) ){

    var sources = unclean.source.split(',');

    var invalid_sources = sources.filter(function(source) {
      return ALL_SOURCES.indexOf(source) === -1;
    });

    if( invalid_sources.length > 0 ){
      invalid_sources.forEach( function( invalid ){
        messages.errors.push('\'' + invalid + '\' is an invalid source parameter. Valid options: ' + ALL_SOURCES_JOINED);
      });
    }

    else {
      var types = sources.reduce(function(acc, source) {
        return acc.concat(sources_map[source]);
      }, []);

      clean.types.from_source = types;
    }

  }

  return messages;
}

module.exports = sanitize;
