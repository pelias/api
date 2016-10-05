var _ = require('lodash');
var sanitizeAll = require('../sanitizer/sanitizeAll');
var reverseSanitizers = require('./reverse').sanitizer_list;

// add categories to the sanitizer list
var sanitizers = _.merge({}, reverseSanitizers, {
  categories: require('../sanitizer/_categories')
});

var sanitize = function(req, cb) { sanitizeAll(req, sanitizers, cb); };

// export sanitize for testing
module.exports.sanitize = sanitize;
module.exports.sanitizer_list = sanitizers;

// middleware
module.exports.middleware = function( req, res, next ){
  sanitize( req, function( err, clean ){
    next();
  });
};
