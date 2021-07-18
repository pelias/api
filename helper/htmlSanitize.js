const _ = require('lodash');
const stripHTML = require('string-strip-html').stripHtml;
const options = { stripTogetherWithTheirContents: ['link', 'script', 'style', 'xml'] };

/**
 * Sanitize HTML in strings by completely removing 'dangerous' elements
 * while keeping the inner HTML of non-dangerous elements.
 *
 * note: Arrays and Objects of strings are supported but currently
 * they are not sanitized *recursively*.
 *
 * see: https://www.npmjs.com/package/string-strip-html
 */

function htmlSanitizeValue(value) {
  if (!_.isString(value)) { return value; }
  return stripHTML(value, options).result;
}

function htmlSanitize(data) {
  if (_.isString(data)) { return htmlSanitizeValue(data); }
  if (_.isArray(data)) { return _.map(data, htmlSanitizeValue); }
  if (_.isPlainObject(data)) { return _.mapValues(data, htmlSanitizeValue); }
  return data;
}

module.exports = htmlSanitize;
