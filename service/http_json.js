const request = require('request');
const bl = require('bl');
const _ = require('lodash');
const isDNT = require( '../helper/logging' ).isDNT;

const logger = require( 'pelias-logger' ).get( 'placeholder' );

module.exports = function setup(serviceConfig) {
  if (!_.conformsTo(serviceConfig, {
    getName: _.isFunction,
    getBaseUrl: _.isFunction,
    getUrl: _.isFunction,
    getParameters: _.isFunction,
    getHeaders: _.isFunction
  })) {
    throw Error('serviceConfig should have a bunch of functions exposed');
  }

  if (_.isEmpty(serviceConfig.getBaseUrl())) {
    logger.warn(`${serviceConfig.getName()} service disabled`);

    return (req, callback) => {
      // respond with an error to any call
      callback(`${serviceConfig.getName()} service disabled`);
    };

  }

  logger.info(`using ${serviceConfig.getName()} service at ${serviceConfig.getBaseUrl()}`);
  return (req, callback) => {
    const options = {
      method: 'GET',
      url: serviceConfig.getUrl(req),
      qs: serviceConfig.getParameters(req),
      headers: serviceConfig.getHeaders(req)
    };

    const do_not_track = isDNT(req);

    if (do_not_track) {
      options.headers.dnt = '1';
    }

    request(options).on('response', (response) => {
      // pipe the response thru bl which will accumulate the entire body
      response.pipe(bl((err, data) => {
        if (response.statusCode === 200) {
          // parse and return w/o error unless response wasn't JSON
          try {
            const parsed = JSON.parse(data);
            return callback(null, parsed);

          }
          catch (err) {
            if (do_not_track) {
              logger.error(`${serviceConfig.getBaseUrl()} [do_not_track] could not parse response: ${data}`);
              return callback(`${serviceConfig.getBaseUrl()} [do_not_track] could not parse response: ${data}`);
            } else {
              logger.error(`${response.request.href} could not parse response: ${data}`);
              return callback(`${response.request.href} could not parse response: ${data}`);
            }

          }
        }
        else {
          // otherwise there was a non-200 status so handle generically
          if (do_not_track) {
            logger.error(`${serviceConfig.getBaseUrl()} [do_not_track] returned status ${response.statusCode}: ${data}`);
            return callback(`${serviceConfig.getBaseUrl()} [do_not_track] returned status ${response.statusCode}: ${data}`);
          } else {
            logger.error(`${response.request.href} returned status ${response.statusCode}: ${data}`);
            return callback(`${response.request.href} returned status ${response.statusCode}: ${data}`);
          }

        }
      }));

    })
    .on('error', (err) => {
      if (do_not_track) {
        logger.error(`${serviceConfig.getBaseUrl()} [do_not_track]: ${JSON.stringify(err)}`);
        callback(err);
      } else {
        logger.error(`${options.url}: ${JSON.stringify(err)}`);
        callback(err);
      }
    });

  };

};
