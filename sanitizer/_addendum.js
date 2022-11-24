const _ = require('lodash');
const peliasConfig = require('pelias-config').generate();

const nonEmptyString = (v) => _.isString(v) && !_.isEmpty(v);

function _sanitize(raw, clean) {

  // error & warning messages
  const messages = { errors: [], warnings: [] };

  // target input params
  const configuredAddendumNamespaces = peliasConfig.get('addendum_namespaces');

  Object.keys(raw)
    .filter(namespace => configuredAddendumNamespaces.hasOwnProperty(namespace))
    .forEach(namespace => {

      if (!nonEmptyString(raw[namespace])) {
        messages.errors.push(namespace + ' should be a non empty string');
      } else {
        const rawValue = raw[namespace].trim();
        const validationType = configuredAddendumNamespaces[namespace].type;
        switch (validationType.toLowerCase()) {
          case 'array':
            const valuesArray = rawValue.split(',').filter(nonEmptyString);
            if (_.isArray(valuesArray) && _.isEmpty(valuesArray)) {
              messages.errors.push(namespace + ' should not be empty');
            } else {
              clean[namespace] = valuesArray;
            }
            break;

          case 'string':
            clean[namespace] = rawValue;
            break;

          case 'number':
            if (isNaN(rawValue)) {
              messages.errors.push(namespace + ': Invalid parameter type, expecting: ' + validationType + ', got NaN: ' + rawValue);
            } else {
              clean[namespace] = Number(rawValue);
            }
            break;

          case 'boolean':
            if ('true' !== rawValue && 'false' !== rawValue) {
              messages.errors.push(namespace + ': Invalid parameter type, expecting: ' + validationType + ', got: ' + rawValue);
            } else {
              clean[namespace] = 'true' === rawValue;
            }
            break;

          case 'object':
            try {
              const parsed = JSON.parse(rawValue);
              if (!_.isObject(parsed)) {
                messages.errors.push(namespace + ': Invalid parameter type, expecting: ' + validationType + ', got ' + rawValue);
              } else if (_.isArray(parsed)) {
                messages.errors.push(namespace + ': Invalid parameter type, expecting: ' + validationType + ', got array: ' + rawValue);
              } else {
                clean[namespace] = parsed;
              }
            } catch (e) {
              messages.errors.push(
                namespace + ': Invalid parameter type, expecting: ' + validationType + ', got invalid JSON: ' + rawValue
              );
            }
            break;

          default:
            messages.errors.push(namespace + ': Unsupported configured type ' + validationType + ', ' +
              'valid types are array, string, number, boolean and object');
        }
      }
    });

  return messages;
}

module.exports = () => ({
  sanitize: _sanitize,
});
