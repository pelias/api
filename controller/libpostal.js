const text_analyzer = require('pelias-text-analyzer');
const _ = require('lodash');
const iso3166 = require('iso3166-1');
const Debug = require('../helper/debug');
const debugLog = new Debug('controller:libpostal');

function setup(should_execute) {
  function controller( req, res, next ){
    // bail early if req/res don't pass conditions for execution
    if (!should_execute(req, res)) {
      return next();
    }
    const initialTime = debugLog.beginTimer(req);
    // parse text with query parser
    const parsed_text = text_analyzer.parse(req.clean.text);

    if (parsed_text !== undefined) {
      // if a known ISO2 country was parsed, convert it to ISO3
      if (_.has(parsed_text, 'country') && iso3166.is2(_.toUpper(parsed_text.country))) {
        parsed_text.country = iso3166.to3(_.toUpper(parsed_text.country));
      }

      req.clean.parsed_text = parsed_text;
    }
    debugLog.stopTimer(req, initialTime);
    return next();

  }

  return controller;
}

module.exports = setup;
