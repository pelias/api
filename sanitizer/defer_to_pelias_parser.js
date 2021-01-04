function shouldUsePeliasParse(req, res) {
  //always use pelias parser output if old parse and queries returned no results
  if (!res.data || res.data.length === 0) {
    return true;
  }

  // if there's no intersection parse, the pelias parser based queries
  // are likely not better, so don't use them
  if (!req.clean.parsed_text.cross_street) {
    return false;
  }

  // usually, pelias parser should be used
  return true;
}

module.exports = (_api_pelias_config, should_execute) => {
  const sanitizeAll = require('../sanitizer/sanitizeAll'),
  sanitizers = {
    debug: require('../sanitizer/_debug')(_api_pelias_config.exposeInternalDebugTools),
    text: require('../sanitizer/_text_pelias_parser')()
  };

  return function(req, res, next) {
    // only run the pelias parser and text sanitizer when determined by predicates
    if (!should_execute(req, res)) {
      return next();
    }

    // save the existing parse and parser name, in case we decide its best not to use
    const existing_parse = req.clean.parsed_text;
    const existing_parser = req.clean.parser;

    // call the pelias parser and update the parse
    sanitizeAll.sanitize(req, sanitizers);

    // look at the output of Pelias Parser and previously returned results (from other parsers/queries)
    // and determine if we should use the Pelias parser or revert to the previous parser output
    if (!shouldUsePeliasParse(req, res)) {
      req.clean.parsed_text = existing_parse;
      req.clean.parser = existing_parser;
    }

    next();
  };

};
