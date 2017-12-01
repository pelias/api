'use strict';

const url = require('url');

const ServiceConfiguration = require('pelias-microservice-wrapper').ServiceConfiguration;

class Libpostal extends ServiceConfiguration {
  constructor(o, propertyExtractor) {
    super('libpostal', o);

    // save off the propertyExtractor function
    // this is used to extract a single property from req.  eg:
    // * _.property('clean.text')
    // * _.property('clean.parsed_text.address')
    // will return those properties from req
    this.propertyExtractor = propertyExtractor;
    
  }

  getParameters(req) {
    return {
      address: this.propertyExtractor(req)
    };

  }

  getUrl(req) {
    return url.resolve(this.baseUrl, 'parse');
  }

}

module.exports = Libpostal;
