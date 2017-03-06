const logger = require( 'pelias-logger' ).get( 'pointinpolygon' );
const request = require('request');

module.exports = (url) => {
  function service( centroid, callback ){
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

  }

  return service;

};
