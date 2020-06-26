const url = require('url');
const _ = require('lodash');
const Debug = require('../../helper/debug');
const debugLog = new Debug('interpolation:request');
const querystring = require('querystring');

const ServiceConfiguration = require('pelias-microservice-wrapper').ServiceConfiguration;

class Interpolation extends ServiceConfiguration {
  constructor(o) {
    super('interpolation', o);
  }

  getParameters(req, hit) {
    let params = {
      number: req.clean.parsed_text.housenumber,
      street: hit.address_parts.street || req.clean.parsed_text.street,
      lat: hit.center_point.lat,
      lon: hit.center_point.lon
    };

    return params;
  }

  getUrl(_req) {
    return url.resolve(this.baseUrl, 'search/geojson');
  }

  getQueryDebug(req, hit) {
    const params = this.getParameters(req, hit);

    if (req.clean.exposeInternalDebugTools) {
      const table = url.resolve(this.baseUrl, 'extract/table') + '?' + querystring.stringify({...params, names: params.street});
      const raw = this.getUrl() + '?' + querystring.stringify(params);
      const demo = url.resolve(this.baseUrl, 'demo') + `/#16/${hit.center_point.lat}/${hit.center_point.lon}` +
        '?' + querystring.stringify({name: params.street});
      return { links: {table, raw, demo}, params };
    } else {
      return { params };
    }
  }
}

module.exports = Interpolation;
