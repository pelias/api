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
    const lang = _.get(req, 'clean.lang.iso6393');
    const parameters = {
      // arrays will be nested, so flatten first, then uniqify, and finally join elements with comma
      ids: _.uniq(_.flattenDeep(ids)).join(',')
    };

    if (lang) {
      parameters.lang = lang;
    }

    return parameters;

  }

  getUrl(req) {
    return url.resolve(this.baseUrl, 'parser/findbyid');
  }

}

module.exports = Language;
