module.exports = function (addendumParameter, type) {
  return function (vs) {
    if (!vs.isset(addendumParameter)) {
      return null;
    }

    switch (type) {
      case 'array':
        return {
          terms: {
            [`addendum.${addendumParameter}`]: vs.var(addendumParameter)
          }
        };
      default:
        return {
          term: {
            [`addendum.${addendumParameter}`]: vs.var(addendumParameter)
          }
        };
    }
  };
};