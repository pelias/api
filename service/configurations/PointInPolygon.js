'use strict';

const url = require('url');

const _ = require('lodash');

const ServiceConfiguration = require('pelias-microservice-wrapper').ServiceConfiguration;

class PointInPolygon extends ServiceConfiguration {
  constructor(o) {
    super('pip', o);
  }

  getUrl(req) {
    // use resolve to eliminate possibility of duplicate /'s in URL
    return url.resolve(this.baseUrl, `${req.clean['point.lon']}/${req.clean['point.lat']}`);
  }

}

module.exports = PointInPolygon;
