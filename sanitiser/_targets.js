
var _ = require('lodash'),
    check = require('check-types');

function setup( paramName, targetMap ) {
  return function( raw, clean ){
    return sanitize( raw, clean, {
      paramName: paramName,
      targetMap: targetMap,
      targetMapKeysString: Object.keys(targetMap).join(',')
    });
  };
}

function sanitize( raw, clean, opts ) {

  // error & warning messages
  var messages = { errors: [], warnings: [] };

  // init clean.types
  clean.types = clean.types || {};

  // the string of targets (comma delimeted)
  var targetsString = raw[opts.paramName];

  // trim whitespace
  if( check.nonEmptyString( targetsString ) ){
    targetsString = targetsString.trim();

    // param must be a valid non-empty string
    if( !check.nonEmptyString( targetsString ) ){
      messages.errors.push(
        opts.paramName + ' parameter cannot be an empty string. Valid options: ' + opts.targetMapKeysString
      );
    }
    else {

      // split string in to array and lowercase each target string
      var targets = targetsString.split(',').map( function( target ){
        return target.toLowerCase(); // lowercase inputs
      });

      // emit an error for each target *not* present in the targetMap
      targets.filter( function( target ){
        return !opts.targetMap.hasOwnProperty(target);
      }).forEach( function( target ){
        messages.errors.push(
          '\'' + target + '\' is an invalid ' + opts.paramName + ' parameter. Valid options: ' + opts.targetMapKeysString
        );
      });

      // only set types value when no error occured
      if( !messages.errors.length ){

        // store the values under a new key as 'clean.types.from_*'
        var typesKey = 'from_' + opts.paramName;

        // ?
        clean.types[typesKey] = targets.reduce(function(acc, target) {
          return acc.concat(opts.targetMap[target]);
        }, []);

        // dedupe in case aliases expanded to common things or user typed in duplicates
        clean.types[typesKey] = _.uniq(clean.types[typesKey]);
      }

    }
  }

  // string is empty
  else if( check.string( targetsString ) ){
    messages.errors.push(
      opts.paramName + ' parameter cannot be an empty string. Valid options: ' + opts.targetMapKeysString
    );
  }


  return messages;
}

module.exports = setup;
