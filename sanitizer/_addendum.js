const _ = require('lodash');
const nonEmptyString = (v) => _.isString(v) && !_.isEmpty(v);
const peliasConfig = require('pelias-config').generate();

function _sanitize(raw, clean) {

  // error & warning messages
  const messages = { errors: [], warnings: [] };

  // target input params
  const configuredAddendumNamespaces = peliasConfig.get('addendum_namespaces');

  Object.keys(raw)
    .filter(field => configuredAddendumNamespaces.hasOwnProperty(field))
    .forEach(field => {
      const rawValue = raw[field];

      if (!nonEmptyString(rawValue)) {
        messages.errors.push(field + ' should not be empty');
      } else {
        const validationType = configuredAddendumNamespaces[field].type;
        if (validationType.toLowerCase() === 'array') {
          const valuesArray = rawValue.split(',').filter(nonEmptyString);
          if (_.isArray(valuesArray) && _.isEmpty(valuesArray)) {
            messages.errors.push(field + ' should not be empty');
          }
        } else {
          if (typeof rawValue !== validationType) {
            messages.errors.push(field + ': Invalid parameter type, expecting: ' + validationType + ', got: ' + rawValue);
          }
          if (validationType === 'number' && isNaN(rawValue)) {
            messages.errors.push(field + ': Invalid parameter type, expecting: ' + validationType + ', got NaN: ' + rawValue);
          }
          if (validationType === 'object' && !_.isObject(rawValue)) {
            messages.errors.push(field + ': Invalid parameter type, expecting: ' + validationType + ', got: ' + rawValue);
          }
          if (validationType === 'object' && _.isArray(rawValue)) {
            messages.errors.push(field + ': Invalid parameter type, expecting: ' + validationType + ', got array: ' + rawValue);
          }
        }
      }
    });

  return messages;
}

module.exports = () => ({
  sanitize: _sanitize,
});
