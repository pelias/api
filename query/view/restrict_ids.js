// Adds a doc id filter to a query
// Used to easily understand why a specific document got the score that it did
module.exports = function (vs) {
  const restrictIds = vs.var('restrictIds').get();

  // no valid restrictIds to use, fail now, don't render this view.
  if (!restrictIds || restrictIds.length < 1) {
    return null;
  }

  return {
    ids: {
      type: '_doc',
      values: restrictIds,
    },
  };
};
