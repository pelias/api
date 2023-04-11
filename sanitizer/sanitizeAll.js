const PeliasParameterError = require('./PeliasParameterError');
const PeliasTimeoutError = require('../sanitizer/PeliasTimeoutError');
const PeliasServiceError = require('../sanitizer/PeliasServiceError');

function getCorrectErrorType(message) {
  if (message.includes('Timeout') || message.includes('timeout')) {
    return new PeliasTimeoutError(message);
  } else if (message.includes('Parse') || message.includes('parse') || message.includes('connect') || message.includes('ECONN')) {
    return new PeliasServiceError(message);
  }

  // most errors are parameter errors
  return new PeliasParameterError(message);
}

// Some Pelias code returns Error objects,
// some returns strings. We want to standardize
// on Error objects here
function ensureInstanceOfError(error) {
  if (error instanceof Error) {
    // preserve the message and stack trace of existing Error objecs
    const newError = getCorrectErrorType(error.message);
    newError.stack = error.stack;
    return newError;
  }

  return getCorrectErrorType(error);
}

function sanitize( req, sanitizers ){
  // init an object to store clean (sanitized) input parameters if not initialized
  req.clean = req.clean || {};

  // init errors and warnings arrays if not initialized
  req.errors = req.errors || [];
  req.warnings = req.warnings || [];

  // source of input parameters
  // (in this case from the GET querystring params)
  const params = req.query || {};

  for (let s in sanitizers) {
    var sanity = sanitizers[s].sanitize( params, req.clean, req );

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

  // all errors must be mapped to a correct Error type to trigger the right HTTP response codes
  req.errors = req.errors.map(ensureInstanceOfError);
}

// Adds to goodParameters every acceptable parameter passed through API call
function checkParameters( req, sanitizers ) {
  req.warnings = req.warnings || [];
  // source of input parameters
  // (in this case from the GET querystring params)
  const params = req.query || {};
  const goodParameters = {};

  for (let s in sanitizers) {

    // checks if function exists
    if (typeof sanitizers[s].expected === 'function'){
      /** expected() returns {array} ex: [{ name: 'text' }] */
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
  // If there are any unexpected parameters & goodParameters isn't empty,
  // add a warning message
  if (Object.keys(goodParameters).length !== 0) {
    for (let p in params) {
      if (!goodParameters.hasOwnProperty(p)){
        req.warnings = req.warnings.concat('Invalid Parameter: ' + p);
      }
    }
  }
}

// runs both sanitize and checkParameters functions in async parallel
function runAllChecks (req, sanitizers) {
  sanitize(req, sanitizers);
  checkParameters(req, sanitizers);
}

// export function
module.exports = {
  sanitize: sanitize,
  checkParameters: checkParameters,
  runAllChecks: runAllChecks
};
