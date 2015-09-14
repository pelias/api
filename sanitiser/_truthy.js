function isTruthy(value) {
  if (typeof value === 'string') {
    return ['true', '1', 'yes', 'y'].indexOf(value) !== -1;
  }

  return value === 1 || value === true;
}

function isTruthyWithDefault(value, default_value) {
  if (typeof default_value === 'undefined') {
    throw new Error('default_value cannot be undefined');
  }

  default_value = !!default_value;

  if (typeof value === 'undefined') {
    return default_value;
  } else {
    return isTruthy(value);
  }

}

module.exports = {
  isTruthy: isTruthy,
  isTruthyWithDefault: isTruthyWithDefault
};
