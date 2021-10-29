// Error subclass for timeouts contacting Pelias services
class PeliasTimeoutError extends Error {
  constructor(message = '') {
    super(message);
  }

  toString() {
    return this.message;
  }

  toJSON() {
    return this.message;
  }
}

module.exports = PeliasTimeoutError;
