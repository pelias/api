/**
 * These values specify how much a record that matches a certain category
 * should be boosted in elasticsearch results.
 */

module.exports.default = {
  'transport:air': 2,
  'transport:air:aerodrome': 2,
  'transport:air:airport': 2,
  'admin': 2
};

module.exports.address = {
  'transport:air': 2,
  'transport:air:aerodrome': 2,
  'transport:air:airport': 2
};
