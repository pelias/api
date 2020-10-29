module.exports = function controller(apiConfig, esclient) {
  return (req, res, next) => {
    esclient
      .search({
        index: 'pelias',
        size: 0,
        body: { aggs: { sources: { terms: { field: 'source' } } } },
      })
      .then((response) => res.json(response));
  };
};
