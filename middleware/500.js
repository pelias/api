const _ = require('lodash');
const logger = require('pelias-logger').get('api');

// handle application errors
function middleware(err, req, res) {
  logger.error('Error: `%s`. Stack trace: `%s`.', err, err.stack);

  if (res.statusCode < 400) {
    logger.info('status code changed from', res.statusCode, 'to 500');
    res.status(500);
  }

  // set error message
  const error = err && err.message ? err.message : err;
  let msg = 'internal server error';
  if (_.isString(error) && !_.isEmpty(error)) {
    msg = error;
  }

  // send response
  res.header('Cache-Control', 'public');
  res.json({ error: msg });
}

module.exports = middleware;
