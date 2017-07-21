var _ = require('lodash'),
    check = require('check-types');

function getValidKeys(mapping) {
  return _.uniq(Object.keys(mapping)).join(',');
}

function _setup( paramName, targetMap ) {
  const opts = {
    paramName: paramName,
    targetMap: targetMap,
    targetMapKeysString: getValidKeys(targetMap)
  };

  return {
    sanitize: function _sanitize( raw, clean ) {
      // error & warning messages
      var messages = { errors: [], warnings: [] };

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
            clean[opts.paramName] = targets.reduce(function(acc, target) {
              return acc.concat(opts.targetMap[target]);
            }, []);

            // dedupe in case aliases expanded to common things or user typed in duplicates
            clean[opts.paramName] = _.uniq(clean[opts.paramName]);
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
    } // end of _sanitize function

  }; // end of object to be returned
} // end of _setup function


module.exports = _setup;
