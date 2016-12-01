const logger = require('pelias-logger').get('api');

// handle not found errors
function middleware(req, res) {
  res.header('Cache-Control','public');
  logger.info('status code', 404);
  res.status(404).json({ error: 'not found: invalid path' });
}

module.exports = middleware;
