'use strict';

const url = require('url');

const _ = require('lodash');

const ServiceConfiguration = require('pelias-microservice-wrapper').ServiceConfiguration;

class Language extends ServiceConfiguration {
  constructor(o) {
    super('interpolation', o);
  }

  getParameters(req, hit) {
    return {
      number: req.clean.parsed_text.number,
      street: hit.address_parts.street || req.clean.parsed_text.street,
      lat: hit.center_point.lat,
      lon: hit.center_point.lon
    };

  }

  getUrl(req) {
    return url.resolve(this.baseUrl, 'search/geojson');
  }

}

module.exports = Language;
