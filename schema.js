
const Joi = require('@hapi/joi');

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
// * api.exposeInternalDebugTools (boolean)
// * api.localization (flipNumberAndStreetCountries is array of 3 character strings)
module.exports = Joi.object().keys({
  api: Joi.object().required().keys({
    version: Joi.string(),
    indexName: Joi.string(),
    host: Joi.string(),
    accessLog: Joi.string().allow(''),
    relativeScores: Joi.boolean(),
    exposeInternalDebugTools: Joi.boolean(),
    requestRetries: Joi.number().integer().min(0),
    customBoosts: Joi.object().keys({
      layer: Joi.object(),
      source: Joi.object()
    }),
    localization: Joi.object().keys({
      flipNumberAndStreetCountries: Joi.array().items(Joi.string().regex(/^[A-Z]{3}$/))
    }).unknown(false),
    pipService: Joi.any(), // got moved to services, ignored for now
    placeholderService: Joi.any().forbidden(), // got moved to services
    services: Joi.object().keys({
      pip: Joi.object().keys({
        url: Joi.string().uri({ scheme: /https?/ }).required(),
        timeout: Joi.number().integer().optional().default(250).min(0),
        retries: Joi.number().integer().optional().default(3).min(0),
      }).unknown(false),
      placeholder: Joi.object().keys({
        url: Joi.string().uri({ scheme: /https?/ }).required(),
        timeout: Joi.number().integer().optional().default(250).min(0),
        retries: Joi.number().integer().optional().default(3).min(0),
      }).unknown(false),
      interpolation: Joi.object().keys({
        url: Joi.string().uri({ scheme: /https?/ }).required(),
        timeout: Joi.number().integer().optional().default(250).min(0),
        retries: Joi.number().integer().optional().default(3).min(0),
      }).unknown(false),
      libpostal: Joi.object().keys({
        url: Joi.string().uri({ scheme: /https?/ }).required(),
        timeout: Joi.number().integer().optional().default(250).min(0),
        retries: Joi.number().integer().optional().default(3).min(0),
      }).unknown(false)
    }).unknown(false).default({}), // default api.services to an empty object
    defaultParameters: Joi.object().keys({
        'focus.point.lat': Joi.number(),
        'focus.point.lon': Joi.number(),
    }).unknown(true).default({})

  }).unknown(true),
  esclient: Joi.object().required().keys({
    requestTimeout: Joi.number().integer().min(0)
  }).unknown(true)
}).unknown(true);
