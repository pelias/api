const async = require('async');

function sanitize( req, sanitizers, cb ){
  // init an object to store clean (sanitized) input parameters if not initialized
  req.clean = req.clean || {};

  // init errors and warnings arrays if not initialized
  req.errors = req.errors || [];
  req.warnings = req.warnings || [];

  // source of input parameters
  // (in this case from the GET querystring params)
  const params = req.query || {};

  for (var s in sanitizers) {
    var sanity = sanitizers[s].sanitize( params, req.clean );

    // if errors occurred then set them
    // on the req object.
    if( sanity.errors.length ){
      req.errors = req.errors.concat( sanity.errors );
    }

    // if warnings occurred then set them
    // on the req object.
    if( sanity.warnings.length ){
      req.warnings = req.warnings.concat( sanity.warnings );
    }
  }
  return cb( undefined, req.clean );
}

// Adds to schemaKeys every acceptable parameter passed through API call
function checkParameters(req, sanitizers, cb) {
  // source of input parameters
  // (in this case from the GET querystring params)
  const params = req.query || {};
  const goodParameters = {};

  for (var s in sanitizers) {

    // checks if there is a function that returns valid params
    if (typeof sanitizers[s].expected === 'function'){
      /** func returns {array} ex: [{ name: 'text' }, { name: 'parsed_text' }] */
      for (let t in sanitizers[s].expected()) {
        /** {object} prop */
        const prop = sanitizers[s].expected()[t];
        if (prop.hasOwnProperty('name')){
          // adds name of valid parameter
          goodParameters[prop.name] = prop.name;
        }
      }
    }
  }
  // If there are any unexpected parameters, add a warning to messages
  for (let p in params) {
    if (!goodParameters.hasOwnProperty(p)){
      req.warnings = req.warnings.concat('Invalid Parameter: ' + p);
    }
  }
  return cb( undefined, req.clean );
}

// runs both sanitize and checkParameters functions in async parallel
function runAllChecks (req, sanitizers, cb) {
  async.parallel([
    sanitize.bind(null, req, sanitizers),
    checkParameters.bind(null, req, sanitizers)
  ], cb);
}

// export function
module.exports = {
  sanitize: sanitize,
  checkParameters: checkParameters,
  runAllChecks: runAllChecks
};
