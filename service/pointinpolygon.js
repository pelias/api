const logger = require( 'pelias-logger' ).get( 'pointinpolygon' );
const request = require('request');
const _ = require('lodash');

function sanitizeUrl(requestUrl) {
  return requestUrl.replace(/^(.+)\/.+\/.+$/, (match, base) => {
    return `${base}/[removed]/[removed]`;
  });
}

function parseErrorMessage(requestUrl, body, do_not_track) {
  if (do_not_track) {
    return `${sanitizeUrl(requestUrl)} returned status 200 but with non-JSON response: ${body}`;
  }

  return `${requestUrl} returned status 200 but with non-JSON response: ${body}`;

}

function serviceErrorMessage(requestUrl, statusCode, body, do_not_track) {
  if (do_not_track) {
    return `${sanitizeUrl(requestUrl)} returned status ${statusCode}: ${body}`;

  } else {
    return `${requestUrl} returned status ${statusCode}: ${body}`;

  }

}

module.exports = (url) => {
  if (!_.isEmpty(url)) {
    logger.info(`using point-in-polygon service at ${url}`);

    return function pointinpolygon( centroid, do_not_track, callback ) {
      const requestUrl = `${url}/${centroid.lon}/${centroid.lat}`;

      const options = {
        method: 'GET',
        url: requestUrl
      };

      if (do_not_track) {
        options.headers = {
          dnt: '1'
        };
      }

      request(options, (err, response, body) => {
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
            const parseMsg = parseErrorMessage(requestUrl, body, do_not_track);

            logger.error(parseMsg);
            callback(parseMsg);
          }
        }
        else {
          const errorMsg = serviceErrorMessage(requestUrl, response.statusCode, body, do_not_track);

          logger.error(errorMsg);
          callback(errorMsg);
        }
      });

    };

  } else {
    logger.warn('point-in-polygon service disabled');

    return (centroid, do_not_track, callback) => {
      callback(`point-in-polygon service disabled, unable to resolve ` +
        (do_not_track ? 'centroid' : JSON.stringify(centroid)));
    };

  }

};
