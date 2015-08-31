/**
 * These values specify how much a document that matches certain parts of an address
 * should be boosted in elasticsearch results.
 */

module.exports = {
  number: 1,
  street: 3,
  zip: 3,
  admin2: 2,
  admin1_abbr: 3,
  alpha3: 5
};
