const _ = require('lodash');

/**
 * Recursive helper function for traverse()
 */
function traverseHelper(obj, keypath, cb) {
  for (let k in obj) {
    const newkeypath = keypath ? keypath + '.' + k : k;

    // If obj[k] is a plain object, recurse on it
    // otherwise, call cb on the value (which will be a string, number, array, boolean or class
    // instance (not used here))
    if (_.isPlainObject(obj[k])) {
      traverseHelper(obj[k], newkeypath, cb);
    } else {
      cb(obj[k], newkeypath);
    }
  }
}

/**
 * Given an object, recurse down the property tree and call cb(value, keypath) on the values
 * found. keypath will be in dotted notation.
 */
function traverse(obj, cb) {
  traverseHelper(obj, undefined, cb);
}

function service(apiConfig, esclient) {
  /**
   * Given a document, expandDocument attempts to create a human readable version of what elastic search
   * indexes (as the result of running analyzers on the incoming document). It does this by asking
   * ES to perform run-time analysis on every field in the document using the analyzers defined at index
   * time.
   *
   * When a document is indexed by ES, it is run through a series of analzyers, that perform tasks like
   * synonym expansion. Because these transformations are only useful for indexing, they are not saved
   * on the indexed document. This makes it hard to reason about what is inside ES. This is a debug
   * function to help make that easier.
   */
  async function expandDocument(doc) {
    const promises = [];
    doc.debug = doc.debug || {};
    doc.debug.expanded = {};

    /**
     * Given a dotted notation field name, and a value, send it to Elastic Search for analysis
     * and add simplified analysis response to doc.debug.expanded.<keypath> when done
     */
    async function analyzeAndSetField(field, value) {
      const isArrayOfString = _.isArray(value) && _.isString(value[0]);

      // per https://www.elastic.co/guide/en/elasticsearch/reference/7.4/indices-analyze.html
      // analyzers only run on strings or arrays of strings
      if (!_.isString(value) && !isArrayOfString) {
        return;
      }

      // For each field, send an RPC to elastic search to analyze it
      // If you give ES the field name, it will match it to the analyzers specified in
      // the schema mapping, without needing to explicitly ask for any individual analyzers
      // 
      // ignore failed responses, they'll get filtered out
      const esResponse = await esclient.indices.analyze({
        index: apiConfig.indexName,
        body: { field, text: value },
      }).catch(() => ({}));

      // Group tokens by position and then make the output more compact
      const tokensByPosition = _.groupBy(esResponse.tokens || [], (token) => token.position);
      const simplifiedTokensByPosition = _.mapValues(tokensByPosition, (tokens) =>
        tokens.map((token) => `${token.token} (${token.type})`)
      );

      // rebuild an object in doc.debug.expanded.[fieldName] with the analysis results
      if (simplifiedTokensByPosition) {
        _.set(doc.debug.expanded, field, simplifiedTokensByPosition);
      }
    }


    // Figure out all the fields that have dynamically defined ngram sub-fields.
    const ngramFields = new Set();
    const mapping = await esclient.indices.getMapping({index: apiConfig.indexName});

    // getMapping returns a map of index name to mappings, but if we ask for the index
    // "pelias" and its an alias to index "pelias-index-2020-08-08," we'll get back the 
    // full name and have a hard time figuring that out so ... just grab the first (and only)
    // mapping dict
    const indexMappings = _.values(mapping)[0] || {};

    if (indexMappings.mappings) {
      traverse(indexMappings.mappings, (_value, keypath) => {
        // keypath will look like: properties.parent.properties.borough.fields.ngram.search_analyzer
        // and we want to extract from that "parent.borough" is a field that has ngrams on it
        if (keypath.includes('.fields.') && keypath.includes('.ngram.')) {
          const keyParts = keypath.split('.');
          const fieldKey = _.dropRight(keyParts.filter((k) => !['properties', 'fields'].includes(k)), 2).join('.');
          ngramFields.add(fieldKey);
        }
      });
    }

    // Go through every field in the doc
    traverse(doc, (value, keypath) => {
      // look up the analyzed version of this in ES
      promises.push(analyzeAndSetField(keypath, value));
      // and also the dynamic .ngram version if that's in our mapping
      if (ngramFields.has(keypath)) {
        promises.push(analyzeAndSetField(keypath + '.ngram', value));
      }
    });

    // for each language on doc.name, simulate the unstored phrase.lang field
    _.forEach(doc.name, (v, k) => {
      promises.push(analyzeAndSetField('phrase.' + k, v));
    });

    return Promise.all(promises);
  }

  return (req, res, next) => {
    if (req.clean.enableDebug && res.data) {
      Promise.all(res.data.map(expandDocument)).then(() => next());
    } else {
      next();
    }
  };
}

module.exports = service;
