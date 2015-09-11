var _ = require('lodash');

function setup(paramName, targetMap) {
  return function (req ) {
    return sanitize(paramName, targetMap, req);
  };
}

function sanitize( paramName, targetMap, req ) {
  var params = req.query || {};

  req.clean = req.clean || {};
  req.clean.types = req.clean.types || {};

  // default case (no sources specified in GET params)
  // there is a case where the property is present, but set to null or undefined
  if (params.hasOwnProperty(paramName) === false || typeof params[paramName] === 'undefined') {
    return { error: false };
  }

  params[paramName] = params[paramName].trim();

  if (params[paramName].length === 0) {
    return {
      error: true,
      message: paramName + ' parameter cannot be an empty string. Valid options: ' + Object.keys(targetMap).join(', ')
    };
  }

  var targets = params[paramName].split(',').map( function( target ){
    return target.toLowerCase(); // lowercase inputs
  });

  var invalidTargets = targets.filter(function(target) {
    return targetMap.hasOwnProperty(target) === false;
  });

  if (invalidTargets.length > 0) {
    return {
      error: true,
      message: invalidTargets[0] + ' is an invalid ' + paramName + ' parameter. Valid options: ' + Object.keys(targetMap).join(', ')
    };
  }

  var cleanPropName = 'from_' + paramName;

  req.clean.types[cleanPropName] = targets.reduce(function(acc, target) {
    return acc.concat(targetMap[target]);
  }, []);

  // dedupe in case aliases expanded to common things or user typed in duplicates
  req.clean.types[cleanPropName] = _.unique(req.clean.types[cleanPropName]);

  return { error: false };
}

module.exports = setup;
