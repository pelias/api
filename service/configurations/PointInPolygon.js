'use strict';

const _ = require('lodash');

const ServiceConfiguration = require('./ServiceConfiguration');

class PointInPolygon extends ServiceConfiguration {
  constructor(o) {
    super('pip', o);
  }

  getUrl(req) {
    return `${this.baseUrl}/${req.clean['point.lon']}/${req.clean['point.lat']}`;
  }

}

module.exports = PointInPolygon;
