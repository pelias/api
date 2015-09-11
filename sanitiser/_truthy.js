function isTruthy(val) {
  if (typeof val === 'string') {
    return ['true', '1', 'yes', 'y'].indexOf(val) !== -1;
  }

  return val === 1 || val === true;
}

module.exports = isTruthy;
