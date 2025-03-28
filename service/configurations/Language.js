const url = require('url');

const _ = require('lodash');

const ServiceConfiguration = require('pelias-microservice-wrapper').ServiceConfiguration;

class Language extends ServiceConfiguration {
  constructor(o) {
    super('language', o);
  }

  getParameters(req, res) {
    // find all the values for all parent _id keys and are not the same ID as the record itself
    const ids = _.get(res, 'data', []).map((doc) => {
      const fields = _.pickBy(doc.parent, (value, key) => {
        if (!_.endsWith(key, '_id')) {
          return false;
        }

        // Don't attempt to translate admin records that actually point to this record
        if (value === doc.source_id) {
          return false;
        }

        return true;
      });
      return _.values(fields);
    });
    //const ids = _.get(res, 'data', []).reduce((acc, doc) => {
      //Array.prototype.push.apply(acc, _.values(_.pickBy(doc.parent, (v, k) => _.endsWith(k, '_id') ) ) );
      //return acc;
    //}, []);
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
