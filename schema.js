'use strict';

const Joi = require('joi');

// Schema Configuration
// required:
// * api.version (string)
// * api.indexName (string)
// * api.host (string)
// * esclient (object - positive integer requestTimeout)
//
// optional:
// * api.accessLog (string)
// * api.relativeScores (boolean)
// * api.legacyUrl (string)
// * api.localization (flipNumberAndStreetCountries is array of 3 character strings)
module.exports = Joi.object().keys({
  api: Joi.object().keys({
    version: Joi.string(),
    indexName: Joi.string(),
    host: Joi.string(),
    legacyUrl: Joi.string(),
    accessLog: Joi.string(),
    relativeScores: Joi.boolean(),
    requestRetries: Joi.number().integer().min(0),
    localization: Joi.object().keys({
      flipNumberAndStreetCountries: Joi.array().items(Joi.string().regex(/^[A-Z]{3}$/))
    }).unknown(false),
    pipService: Joi.string().uri({ scheme: /https?/ })

  }).requiredKeys('version', 'indexName', 'host').unknown(true),
  esclient: Joi.object().keys({
    requestTimeout: Joi.number().integer().min(0)
  }).unknown(true)
}).requiredKeys('api', 'esclient').unknown(true);
