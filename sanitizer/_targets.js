const _ = require('lodash');

const INVALID_NEGATIVE_TARGETS_ERROR = 'contains positive and negative options in a combination ' +
 'that results in an empty list. Please chose a different combination';

function getValidKeys(mapping) {
  return _.uniq(Object.keys(mapping)).join(',');
}

function expandAliases(targets, targetMap) {
  const expanded = targets.reduce((acc, target) => acc.concat(targetMap[target]), []);

  // return deduplicated list using `Set`
  return [...new Set(expanded)];
}

function allTargets(targetMap) {
  return [...new Set(Object.values(targetMap).flat())];
}

function _setup( paramName, targetMap ) {
  const opts = {
    paramName: paramName,
    targetMap: targetMap
  };

  return {
    sanitize: function _sanitize( raw, clean ) {
      // error & warning messages
      var messages = { errors: [], warnings: [] };

      // the string of targets (comma delimited)
      var targetsString = raw[opts.paramName];

      // input is not a string, parameter is not defined, can quit early
      if (!_.isString(targetsString)) {
        return messages;
      }

      // remove all whitespace characters
      targetsString = targetsString.replace(/\s/g,'');

      // return error if parameter ends up being all whitespace
      if( _.isEmpty( targetsString ) ){
        messages.errors.push(
          opts.paramName + ' parameter cannot be an empty string. Valid options: ' + getValidKeys(opts.targetMap)
        );
        return messages;
      }

      // split string in to array and lowercase each target string
      var targets = targetsString.split(',').map( function( target ){
        return target.toLowerCase(); // lowercase inputs
      });

      const positive_targets = targets.filter((t) => t[0] !== '-' );

      const negative_targets = targets.filter((t) => t[0] === '-' )
        .map((t) => t.slice(1)); // remove the leading '-' from the negative target so it can be validated easily

      // emit an error for each target *not* present in the targetMap
      positive_targets.concat(negative_targets).filter( target => !opts.targetMap.hasOwnProperty(target) ).forEach(( target ) =>{
        messages.errors.push(
          `\'${target}\' is an invalid ${opts.paramName} parameter. Valid options: ${getValidKeys(opts.targetMap)}`
        );
      });

      // calculate the "effective" list of positive and negative targets, by expanding aliases
      const effective_positive_targets = expandAliases(positive_targets, opts.targetMap);
      const effective_negative_targets = expandAliases(negative_targets, opts.targetMap);

      const all_targets = allTargets(opts.targetMap);

      // for calculating the final list of targets use either:
      // - the list of positive targets, if there are any
      // - otherwise, the list of all possible targets
      const starting_positive_targets = positive_targets.length ?
        effective_positive_targets :
        all_targets;

      // the final list of targets is the positive list, with the negative list excluded
      const final_targets = starting_positive_targets.filter((t) => !effective_negative_targets.includes(t));

      if (final_targets.length === 0) {
        messages.errors.push(
          `${opts.paramName} ${INVALID_NEGATIVE_TARGETS_ERROR}`
        );
      }

      clean[`positive_${opts.paramName}`] = effective_positive_targets;
      clean[`negative_${opts.paramName}`] = effective_negative_targets;

      // only set final value when no error occurred
      if( !messages.errors.length ){
        clean[opts.paramName] = final_targets;
      }

      return messages;
    } // end of _sanitize function

  }; // end of object to be returned
} // end of _setup function

module.exports = _setup;
