module.exports = function (addendumParameter) {
  return function (vs) {
    if (!vs.isset(addendumParameter)) {
      return null;
    }

    return {
      terms: {
        [`addendum.${addendumParameter}`]: vs.var(addendumParameter)
      }
    };
  };
};