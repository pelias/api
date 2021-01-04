function toMultiFields(baseField, suffix) {
  return [baseField, toSingleField(baseField, suffix)];
}

function toSingleField(baseField, suffix) {
  // baseField looks like phrase.default or name.default; suffix looks like en, fr....
  const parts = baseField.split('.');
  parts[parts.length - 1] = suffix;
  return parts.join('.');
}

module.exports = { toMultiFields, toSingleField };