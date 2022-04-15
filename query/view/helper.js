function toMultiFields(baseField, ...suffix) {
  return [baseField, ...suffix.map(suffix => toSingleField(baseField, suffix))];
}

function toSingleField(baseField, suffix) {
  // baseField looks like phrase.default or name.default; suffix looks like en, fr....
  const parts = baseField.split('.');
  parts[parts.length - 1] = suffix;
  return parts.join('.');
}

function toMultiFieldsWithWildcards(baseField, ...suffix) {
  const result = [];
  toMultiFields(baseField, ...suffix).forEach(field => {
    result.push(field, `${field}_*`);
  });
  return result;
}

module.exports = { toMultiFields, toSingleField, toMultiFieldsWithWildcards };
