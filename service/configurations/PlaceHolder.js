'use strict';

const url = require('url');

const _ = require('lodash');

const ServiceConfiguration = require('pelias-microservice-wrapper').ServiceConfiguration;

class PlaceHolder extends ServiceConfiguration {
  constructor(o) {
    super('placeholder', o);
  }

  getParameters(req) {
    const parameters = {
      text: req.clean.text
    };

    if (_.has(req.clean, 'lang.iso6393')) {
      parameters.lang = req.clean.lang.iso6393;
    }

    return parameters;
  }

  getUrl(req) {
    return url.resolve(this.baseUrl, 'parser/search');
  }

}

module.exports = PlaceHolder;
