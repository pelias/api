var logger = require('pelias-logger').get('request-size-limit');
var check = require('check-types');

var SIZE_LIMIT;

function setup(peliasConfig) {
  if(check.assigned(peliasConfig)) {
    SIZE_LIMIT = peliasConfig.hasOwnProperty('bulkSizeLimit') ? peliasConfig.bulkSizeLimit : 50;
  }

  return enforceSizeLimit;
}

function enforceSizeLimit(req, res, next) {
  if(SIZE_LIMIT && Array.isArray(req.clean) && req.clean.length > SIZE_LIMIT) {
    return res.status(400).json({ error: 'Maximum request array size exceeded' });
  }

  return next();
}

module.exports = setup;
