function toMultiFields(baseField, suffix) {
  // baseField looks like phrase.default or name.default; suffix looks like en, fr....
  const parts = baseField.split('.');
  parts[parts.length - 1] = suffix;
  return [baseField, parts.join('.')];
}

module.exports = { toMultiFields };