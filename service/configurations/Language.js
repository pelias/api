'use strict';

const url = require('url');

const _ = require('lodash');

const ServiceConfiguration = require('pelias-microservice-wrapper').ServiceConfiguration;

class Language extends ServiceConfiguration {
  constructor(o) {
    super('language', o);
  }

  getParameters(req, res) {
    // find all the values for all keys with names that end with '_id'
    const ids = _.get(res, 'data', []).reduce((acc, doc) => {
      Array.prototype.push.apply(acc, _.values(_.pickBy(doc.parent, (v, k) => _.endsWith(k, '_id') ) ) );
      return acc;
    }, []);

    return {
      // arrays will be nested, so flatten first, then uniqify, and finally join elements with comma
      ids: _.uniq(_.flattenDeep(ids)).join(',')
    };

  }

  getUrl(req) {
    return url.resolve(this.baseUrl, 'parser/findbyid');
  }

}

module.exports = Language;
