const _ = require('lodash');
const es = require('elasticsearch');
const logger = require( 'pelias-logger' ).get( 'api' );
const PeliasParameterError = require('../sanitizer/PeliasParameterError');
const PeliasTimeoutError = require('../sanitizer/PeliasTimeoutError');
const PeliasServiceError = require('../sanitizer/PeliasServiceError');

function isParameterError(error) {
  return error instanceof PeliasParameterError;
}

function isServiceError(error) {
  return error instanceof PeliasServiceError;
}

function isTimeoutError(error) {
  return error instanceof PeliasTimeoutError ||
         error instanceof es.errors.RequestTimeout;
}

function isElasticsearchError(error) {
  const knownErrors = [ es.errors.NoConnections,
                        es.errors.ConnectionFault ];

  return knownErrors.some(function(esError) {
    return error instanceof esError;
  });
}

function sendJSONResponse(req, res, next) {

  // do nothing if no result data set
  const geocoding = _.get(res, 'body.geocoding');

  if (!_.isPlainObject(geocoding)) {
    return next();
  }

  const errors = geocoding.errors || [];

  const errorCodes = errors.map(function(error) {
    if (isParameterError(error)) {
      return 400;
    } else if (isTimeoutError(error) || isElasticsearchError(error) || isServiceError(error)) {
      return 502;
    } else {
      return 500;
    }
  });

  const statusCode = Math.max(200, ...errorCodes);

  // respond
  return res.status(statusCode).json(res.body);
}

module.exports = sendJSONResponse;
