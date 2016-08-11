var _ = require('lodash');
var sanitizeAll = require('../sanitiser/sanitizeAll');
var reverseSanitizers = require('./reverse').sanitiser_list;

// add categories to the sanitizer list
var sanitizers = _.merge({}, reverseSanitizers, {
  categories: require('../sanitiser/_categories')
});

var sanitize = function(req, cb) { sanitizeAll(req, sanitizers, cb); };

// export sanitize for testing
module.exports.sanitize = sanitize;
module.exports.sanitiser_list = sanitizers;

// middleware
module.exports.middleware = function( req, res, next ){
  sanitize( req, function( err, clean ){
    next();
  });
};
