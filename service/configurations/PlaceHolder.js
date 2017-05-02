'use strict';

const _ = require('lodash');

const ServiceConfiguration = require('./ServiceConfiguration');

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
    return `${this.baseUrl}/search`;
  }

}

module.exports = PlaceHolder;
