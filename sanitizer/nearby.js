var _ = require('lodash');
var sanitizeAll = require('../sanitizer/sanitizeAll');
var reverseSanitizers = require('./reverse').sanitizer_list;

// add categories to the sanitizer list
var sanitizers = _.merge({}, reverseSanitizers, {
  categories: require('../sanitizer/_categories')()
});

var sanitize = sanitizeAll.runAllChecks;

// export sanitize for testing
module.exports.sanitize = sanitize;
module.exports.sanitizer_list = sanitizers;

// middleware
module.exports.middleware = function( req, res, next ){
  sanitizeAll.runAllChecks(req, sanitizers);
  next();
};
