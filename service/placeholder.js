const request = require('request');
const bl = require('bl');
const _ = require('lodash');

const logger = require( 'pelias-logger' ).get( 'placeholder' );

module.exports = function setup(url) {
  if (_.isEmpty(url)) {
    logger.warn('placeholder service disabled');

    return {
      search: (text, lang, do_not_track, callback) => {
        callback(`placeholder service disabled`);
      }
    };

  }

  logger.info(`using placeholder service at ${url}`);
  return {
    search: (text, lang, do_not_track, callback) => {
      const requestUrl = `${url}/search?text=${text}&lang=${lang}`;

      const options = {
        method: 'GET',
        url: requestUrl
      };

      if (do_not_track) {
        options.headers = {
          dnt: '1'
        };
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
              logger.error(`${encodeURI(requestUrl)} could not parse response: ${data}`);
              return callback(`${encodeURI(requestUrl)} could not parse response: ${data}`);
            }
          }
          else {
            // otherwise there was a non-200 status so handle generically
            logger.error(`${encodeURI(requestUrl)} returned status ${response.statusCode}: ${data}`);
            return callback(`${encodeURI(requestUrl)} returned status ${response.statusCode}: ${data}`);
          }
        }));

      })
      .on('error', (err) => {
        logger.error(JSON.stringify(err));
        callback(err);
      });

    }
  };

};
