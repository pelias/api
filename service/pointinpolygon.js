const logger = require( 'pelias-logger' ).get( 'pointinpolygon' );
const request = require('request');
const _ = require('lodash');

module.exports = (url) => {
  if (!_.isEmpty(url)) {
    logger.info(`using point-in-polygon service at ${url}`);

    return function pointinpolygon( centroid, callback ) {
      const requestUrl = `${url}/${centroid.lon}/${centroid.lat}`;

      request.get(requestUrl, (err, response, body) => {
        if (err) {
          logger.error(JSON.stringify(err));
          callback(err);
        }
        else if (response.statusCode === 200) {
          try {
            const parsed = JSON.parse(body);
            callback(err, parsed);
          }
          catch (err) {
            logger.error(`${requestUrl}: could not parse response body: ${body}`);
            callback(`${requestUrl} returned status 200 but with non-JSON response: ${body}`);
          }
        }
        else {
          logger.error(`${requestUrl} returned status ${response.statusCode}: ${body}`);
          callback(`${requestUrl} returned status ${response.statusCode}: ${body}`);
        }
      });

    };

  } else {
    logger.warn('point-in-polygon service disabled');

    return (centroid, callback) => {
      callback(`point-in-polygon service disabled, unable to resolve ${JSON.stringify(centroid)}`);
    };

  }

};
