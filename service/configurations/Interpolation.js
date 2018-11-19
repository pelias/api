const url = require('url');
const _ = require('lodash');
const Debug = require('../../helper/debug');
const debugLog = new Debug('interpolation:request');

const ServiceConfiguration = require('pelias-microservice-wrapper').ServiceConfiguration;

class Interpolation extends ServiceConfiguration {
  constructor(o) {
    super('interpolation', o);
  }

  getParameters(req, hit) {
    let params = {
      number: req.clean.parsed_text.number,
      street: hit.address_parts.street || req.clean.parsed_text.street,
      lat: hit.center_point.lat,
      lon: hit.center_point.lon
    };

    debugLog.push(req, params);

    return params;
  }

  getUrl(req) {
    return url.resolve(this.baseUrl, 'search/geojson');
  }

}

module.exports = Interpolation;
